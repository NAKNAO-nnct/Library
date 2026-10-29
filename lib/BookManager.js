import Api from './APIUtil.js'
import Tsv from './Tsv.js'
import LocalStorage from './LocalStorage.js'
import conf from './config.js'
import { DATA_FILES, toBytes, contentHash, cacheHash, validateLibrary, validateManifest } from './LibraryData.js'

export class FolderNotFoundError extends Error {
  constructor(id) {
    super(`フォルダが見つかりません: ${id}`)
    this.name = 'FolderNotFoundError'
    this.statusCode = 404
  }
}

function groupByParent(rows) {
  const groups = new Map()
  for (const row of rows) {
    if (!groups.has(row.parent_id)) groups.set(row.parent_id, [])
    groups.get(row.parent_id).push(row)
  }
  return groups
}

export class BookManager {
  constructor({ api = new Api(), storage = LocalStorage, config = conf } = {}) {
    this.api = api
    this.storage = storage
    this.config = config
    this.generation = 0
    this.clear()
  }

  init({ force = false } = {}) {
    if (force) this.clear()
    if (!this.initialization) this.initialization = this.load(force, this.generation)
    return this.initialization
  }

  async load(force, generation) {
    try {
      const dataset = await this.readData(force)
      // A clear or a newer reload invalidates both results and errors from this request.
      if (generation !== this.generation) return this.initialization
      this.list = dataset.list
      this.folder = dataset.folder
      this.foldersById = new Map(this.folder.data.map((folder) => [folder._id, folder]))
      this.foldersByParent = groupByParent(this.folder.data)
      this.booksByParent = groupByParent(this.list.data)
      if (!dataset.fromCache) this.saveCache(dataset)
      return this
    } catch (error) {
      if (generation !== this.generation) return this.initialization
      this.initialization = null
      throw error
    }
  }

  async readData(force) {
    const { data: manifest } = await this.api.get('/library-data.json', {}, { cacheBust: true })
    validateManifest(manifest)
    const keys = this.config
    if (!force && this.storage.get(keys.LOCALSTORAGE_DATAVERSION_KEY) === manifest.version) {
      try {
        const cachedBooks = this.storage.get(keys.LOCALSTORAGE_BOOKLIST_KEY)
        const cachedFolders = this.storage.get(keys.LOCALSTORAGE_FOLDERLIST_KEY)
        const list = new Tsv([cachedBooks.header, ...cachedBooks.body])
        const folder = new Tsv([cachedFolders.header, ...cachedFolders.body])
        validateLibrary(list, folder)
        this.verifyTables(list, folder, manifest)
        return { list, folder, manifest, fromCache: true }
      } catch {
        // Invalid, corrupted, and older cache formats are replaced from the source files.
      }
    }
    const tables = await Promise.all(
      Object.values(DATA_FILES).map(async (name) => {
        const expected = manifest.files[name].sha256
        const { data } = await this.api.get('/' + name, { version: expected }, { responseType: 'arraybuffer' })
        const bytes = toBytes(data)
        if (contentHash(bytes) !== expected) throw new Error(`${name}: 更新情報とCSVの内容が一致しません。再読込してください。`)
        return new Tsv(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
      }),
    )
    const [list, folder] = tables
    validateLibrary(list, folder)
    this.verifyTables(list, folder, manifest)
    return { list, folder, manifest, fromCache: false }
  }

  verifyTables(list, folder, manifest) {
    if (
      list.data.length !== manifest.bookCount ||
      folder.data.length !== manifest.folderCount ||
      cacheHash(list) !== manifest.files[DATA_FILES.books].cacheHash ||
      cacheHash(folder) !== manifest.files[DATA_FILES.folders].cacheHash
    ) {
      throw new Error('蔵書データの内容が更新情報と一致しません。配信状態を確認してください。')
    }
  }

  saveCache({ list, folder, manifest }) {
    const keys = this.config
    try {
      this.storage.remove(keys.LOCALSTORAGE_DATAVERSION_KEY)
      this.storage.set(keys.LOCALSTORAGE_BOOKLIST_KEY, list.toCache())
      this.storage.set(keys.LOCALSTORAGE_FOLDERLIST_KEY, folder.toCache())
      this.storage.set(keys.LOCALSTORAGE_DATAVERSION_KEY, manifest.version)
    } catch (error) {
      console.warn('蔵書データを保存できないため、メモリ上のデータを使用します。', error)
    }
  }

  clearStorage() {
    this.clear()
    this.storage.remove(this.config.LOCALSTORAGE_BOOKLIST_KEY)
    this.storage.remove(this.config.LOCALSTORAGE_FOLDERLIST_KEY)
    this.storage.remove(this.config.LOCALSTORAGE_DATAVERSION_KEY)
  }

  clear() {
    this.generation += 1
    this.initialization = null
    this.list = { data: [] }
    this.folder = { data: [] }
    this.foldersById = new Map()
    this.foldersByParent = new Map()
    this.booksByParent = new Map()
  }

  hasFolder(id) {
    return typeof id === 'string' && (id === '-1' || this.foldersById.has(id))
  }

  assertFolder(id) {
    if (!this.hasFolder(id)) throw new FolderNotFoundError(id)
  }

  async getFolderListForId(id) {
    await this.init()
    this.assertFolder(id)
    return [...(this.foldersByParent.get(id) ?? [])]
  }

  async getBookListForId(id) {
    await this.init()
    this.assertFolder(id)
    return [...(this.booksByParent.get(id) ?? [])]
  }

  getFolderPath(id) {
    this.assertFolder(id)
    const path = []
    while (id !== '-1') {
      const folder = this.foldersById.get(id)
      path.push(folder)
      id = folder.parent_id
    }
    return [{ _id: '-1', name: 'トップ' }, ...path.reverse()]
  }
}

export default new BookManager()

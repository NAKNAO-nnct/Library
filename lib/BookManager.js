import Api from './APIUtil.js'
import Tsv from './Tsv.js'
import LocalStorage from './LocalStorage.js'
import conf from './config.js'

export class BookManager {
  constructor({ api = new Api(''), storage = LocalStorage, config = conf } = {}) {
    this.book = api
    this.storage = storage
    this.config = config
    this.clear()
  }

  // 木構造初期化
  initTree() {
    this.tree = []
  }

  // 初期化
  init({ force = false } = {}) {
    if (force) this.clear()
    if (!this.initialization) {
      this.initialization = this.load(force).catch((error) => {
        this.initialization = null
        throw error
      })
    }
    return this.initialization
  }

  async load(force) {
    const { data: manifest } = await this.book.get('/library-data.json')
    const keys = this.config
    const cachedBooks = this.storage.get(keys.LOCALSTORAGE_BOOKLIST_KEY)
    const cachedFolders = this.storage.get(keys.LOCALSTORAGE_FOLDERLIST_KEY)
    if (!force && this.storage.get(keys.LOCALSTORAGE_DATAVERSION_KEY) === manifest.version) {
      try {
        this.list = new Tsv([cachedBooks.header, ...cachedBooks.body])
        this.folder = new Tsv([cachedFolders.header, ...cachedFolders.body])
        if (this.list.data.length === manifest.bookCount && this.folder.data.length === manifest.folderCount) return 2
      } catch {
        // Invalid or older cache formats are replaced from the source files.
      }
    }
    const [books, folders] = await Promise.all([this.book.get('/dat_product.csv'), this.book.get('/dat_folder.csv')])
    const list = new Tsv(books.data)
    const folder = new Tsv(folders.data)
    if (list.data.length !== manifest.bookCount || folder.data.length !== manifest.folderCount) {
      throw new Error('蔵書データの件数が一致しません。データの配信状態を確認してください。')
    }
    this.list = list
    this.folder = folder
    try {
      this.storage.remove(keys.LOCALSTORAGE_DATAVERSION_KEY)
      this.storage.set(keys.LOCALSTORAGE_BOOKLIST_KEY, list.toCache())
      this.storage.set(keys.LOCALSTORAGE_FOLDERLIST_KEY, folder.toCache())
      this.storage.set(keys.LOCALSTORAGE_DATAVERSION_KEY, manifest.version)
    } catch (error) {
      console.warn('蔵書データを保存できないため、メモリ上のデータを使用します。', error)
    }
    return 2
  }

  clearStorage() {
    this.storage.remove(this.config.LOCALSTORAGE_BOOKLIST_KEY)
    this.storage.remove(this.config.LOCALSTORAGE_FOLDERLIST_KEY)
    this.storage.remove(this.config.LOCALSTORAGE_DATAVERSION_KEY)
    this.clear()
  }

  clear() {
    this.list = { data: [] }
    this.folder = { data: [] }
    this.initialization = null
  }

  // フォルダIDからフォルダリストを取得する
  async getFolderListForId(fid) {
    return await this.init().then(() => {
      return this.folder.data.filter((e) => e.parent_id === fid)
    })
  }

  // フォルダIDから本リストを取得する
  async getBookListForId(fid) {
    return await this.init().then(() => {
      return this.list.data.filter((e) => e.parent_id === fid)
    })
  }

  // フォルダIDから階層を探る
  getFolderListForIdSync(fid) {
    if (fid === '-1') {
      this.tree.push({
        text: 'トップ',
        to: '/folder/-1',
        disabled: this.tree.length === 0,
      })
      return fid
    }
    const tmpFolder = this.folder.data.filter((e) => e._id === fid)[0]
    this.tree.push({
      text: tmpFolder.name,
      to: '/folder/' + tmpFolder._id,
      disabled: this.tree.length === 0,
    })
    return this.getFolderListForIdSync(tmpFolder.parent_id)
  }

  getTreeStructure(fid) {
    this.initTree()
    if (this.getFolderListForIdSync(fid) === '-1') {
      return this.tree.reverse()
    }
  }
}

export default new BookManager()

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, readFile, readdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import Tsv from '../lib/Tsv.js'
import { createLibraryManifest, prepareLibrary } from '../scripts/prepare-library.mjs'
import { BookManager } from '../lib/BookManager.js'
import LocalStorage from '../lib/LocalStorage.js'
import { mergeBookDetails } from '../lib/BookDetails.js'
import { contentHash } from '../lib/LibraryData.js'
import { createHash } from 'node:crypto'

const bookText = '_id\tparent_id\ttitle\tisbn\tauthor\tpublisher\n1\t10\t本1\t9780000000001\t著者\t出版社\n'
const folderText = '_id\tparent_id\tname\n10\t-1\t本棚\n'
const config = {
  LOCALSTORAGE_BOOKLIST_KEY: 'books',
  LOCALSTORAGE_FOLDERLIST_KEY: 'folders',
  LOCALSTORAGE_DATAVERSION_KEY: 'version',
}

function sourceFiles(books = bookText, folders = folderText) {
  return { 'dat_product.csv': Buffer.from(books), 'dat_folder.csv': Buffer.from(folders) }
}

class MemoryStorage {
  data = new Map()
  get(key) {
    return structuredClone(this.data.get(key) ?? [])
  }
  set(key, value) {
    this.data.set(key, structuredClone(value))
  }
  remove(key) {
    this.data.delete(key)
  }
}

function setup(storage = new MemoryStorage(), books = bookText) {
  const manifest = createLibraryManifest(sourceFiles(books))
  const requests = []
  const api = {
    async get(path) {
      requests.push(path)
      const data = {
        '/library-data.json': manifest,
        '/dat_product.csv': books,
        '/dat_folder.csv': folderText,
      }[path]
      assert.notEqual(data, undefined, path)
      return { data }
    },
  }
  return { manager: new BookManager({ api, storage, config }), requests, storage, api, manifest }
}

test('TSV handles BOM, CRLF, quoted tabs/newlines, final blank lines, and all columns', () => {
  const parsed = new Tsv('\uFEFF_id\ttitle\tmemo\r\n1\t"本\t1"\t"行1\n行2"\r\n\r\n')
  assert.deepEqual(parsed.data, [{ _id: '1', title: '本\t1', memo: '行1\n行2' }])
  assert.deepEqual(new Tsv([parsed.header, ...parsed.body]).data, parsed.data)
  assert.deepEqual(new Tsv('_id\ttitle\n1\t本').data, [{ _id: '1', title: '本' }])
  assert.throws(() => new Tsv('_id\ttitle\n1'), /列数/)
})

test('manifest uses product/folder CSV content and detects edits without a record count change', () => {
  const result = createLibraryManifest(sourceFiles())
  assert.equal(result.bookCount, 1)
  assert.equal(result.folderCount, 1)
  assert.equal(createLibraryManifest(sourceFiles()).version, result.version)
  assert.notEqual(createLibraryManifest(sourceFiles(bookText.replace('本1', '本2'))).version, result.version)
  assert.notEqual(createLibraryManifest(sourceFiles(bookText, folderText.replace('本棚', '新しい棚'))).version, result.version)
})

test('invalid CSV data is rejected: required files, IDs, references, and cycles', () => {
  assert.throws(() => createLibraryManifest({}), /dat_product.csv/)
  assert.throws(() => createLibraryManifest(sourceFiles(bookText + bookText.split('\n')[1] + '\n')), /重複/)
  assert.throws(() => createLibraryManifest(sourceFiles(bookText.replace('\t10\t', '\t99\t'))), /親フォルダ/)
  assert.throws(() => createLibraryManifest(sourceFiles(bookText, folderText.replace('10\t-1', '10\t10'))), /循環/)
})

test('preparation reads public CSV files without a ZIP and never overwrites the placed data', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'library-prepare-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, 'public'))
  for (const [name, bytes] of Object.entries(sourceFiles())) await writeFile(join(root, 'public', name), bytes)
  const result = await prepareLibrary(root)
  assert.equal(await readFile(join(root, 'public/dat_product.csv'), 'utf8'), bookText)
  assert.equal(await readFile(join(root, 'public/dat_folder.csv'), 'utf8'), folderText)
  assert.equal(JSON.parse(await readFile(join(root, 'public/library-data.json'), 'utf8')).version, result.version)
  assert.deepEqual((await readdir(join(root, 'public'))).sort(), ['dat_folder.csv', 'dat_product.csv', 'library-data.json'])
  const changedBooks = bookText.replace('本1', '差し替えた本')
  await writeFile(join(root, 'public/dat_product.csv'), changedBooks)
  const changed = await prepareLibrary(root)
  assert.notEqual(changed.version, result.version)
  assert.equal(await readFile(join(root, 'public/dat_product.csv'), 'utf8'), changedBooks)
})

test('legacy cache is replaced and concurrent requests share one dataset load', async () => {
  const { manager, storage, requests, manifest } = setup()
  storage.set('books', { data: [{ title: '古い本' }] })
  await Promise.all([manager.init(), manager.init(), manager.getBookListForId('10')])
  assert.equal(manager.list.data[0].title, '本1')
  assert.equal(requests.length, 3)
  assert.equal(storage.get('version'), manifest.version)
  assert.equal(storage.get('books').data, undefined)
  assert.deepEqual(
    manager.getFolderPath('10').map((item) => item.name),
    ['トップ', '本棚'],
  )
  const cached = setup(storage)
  await cached.manager.init()
  assert.deepEqual(cached.requests, ['/library-data.json'])
  assert.deepEqual(cached.manager.list.data, manager.list.data)
})

test('changed source revision refreshes data even when the record count is unchanged', async () => {
  const initial = setup()
  await initial.manager.init()
  const updated = setup(initial.storage, bookText.replace('本1', '更新された本'))
  await updated.manager.init()
  assert.equal(updated.manager.list.data[0].title, '更新された本')
  assert.equal(updated.storage.get('version'), updated.manifest.version)
  assert.equal(updated.requests.length, 3)
})

test('reload bypasses a current cache, and clearing removes its revision', async () => {
  const { manager, storage, requests } = setup()
  await manager.init()
  await manager.init({ force: true })
  assert.equal(requests.length, 6)
  storage.set('unrelated', 'keep')
  manager.clearStorage()
  assert.deepEqual(storage.get('version'), [])
  assert.equal(storage.get('unrelated'), 'keep')
  assert.deepEqual(manager.list.data, [])
})

test('failed data loads can be retried, and invalid caches are repaired', async () => {
  const fixture = setup()
  const original = fixture.api.get
  let fail = true
  fixture.api.get = async (path) => {
    if (fail && path === '/dat_product.csv') throw new Error('offline')
    return original(path)
  }
  await assert.rejects(fixture.manager.init(), /offline/)
  fail = false
  await fixture.manager.init()
  fixture.storage.set('books', { header: ['_id', 'title'], body: [['1']] })
  const repaired = setup(fixture.storage)
  await repaired.manager.init()
  assert.equal(repaired.requests.length, 3)
  assert.equal(repaired.manager.list.data[0].title, '本1')
})

test('storage quota failure does not prevent displaying the source data', async (t) => {
  const { manager, storage } = setup()
  storage.set = () => {
    throw new Error('QuotaExceededError')
  }
  t.mock.method(console, 'warn', () => {})
  await manager.init()
  assert.equal(manager.list.data[0].title, '本1')
  assert.deepEqual(storage.get('version'), [])
})

test('LocalStorage removal is immediately visible and malformed or unrelated values do not break reads', (t) => {
  const values = new Map([
    ['book', JSON.stringify({ data: [1] })],
    ['unrelated', 'not JSON'],
  ])
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  t.after(() => {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else Reflect.deleteProperty(globalThis, 'localStorage')
  })
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => values.get(key) ?? null,
      removeItem: (key) => values.delete(key),
    },
  })
  assert.deepEqual(LocalStorage.get('book'), { data: [1] })
  LocalStorage.remove('book')
  assert.deepEqual(LocalStorage.get('book'), [])
  assert.deepEqual(LocalStorage.get('unrelated'), [])
})

test('book details prefer source metadata/images and survive absent OpenBD records', () => {
  const local = [{ isbn: '1', title: '元のタイトル', author: '元の著者', publisher: '元の出版社', large_image_url: 'source.jpg' }]
  const remote = [{ summary: { isbn: '1', title: '別タイトル', cover: 'api.jpg' } }, null]
  assert.equal(mergeBookDetails(['1'], local, remote)[0].cover, 'source.jpg')
  assert.equal(mergeBookDetails(['1'], local, remote)[0].title, '元のタイトル')
  assert.equal(mergeBookDetails(['1'], local)[0].author, '元の著者')
  assert.deepEqual(mergeBookDetails(['missing'], local), [])
})

test('same-count CSV from another release is rejected before displaying or caching it', async () => {
  const fixture = setup()
  const original = fixture.api.get
  fixture.api.get = async (path, ...args) => (path === '/dat_product.csv' ? { data: bookText.replace('本1', '別の版') } : original(path, ...args))
  await assert.rejects(fixture.manager.init(), /CSVの内容が一致しません/)
  assert.deepEqual(fixture.manager.list.data, [])
  assert.deepEqual(fixture.storage.get('version'), [])
  fixture.api.get = original
  await fixture.manager.init()
  assert.equal(fixture.manager.list.data[0].title, '本1')
})

test('valid-shaped cache with modified contents is not trusted', async () => {
  const fixture = setup()
  await fixture.manager.init()
  const cached = fixture.storage.get('books')
  cached.body[0][2] = '改変された本'
  fixture.storage.set('books', cached)
  const repaired = setup(fixture.storage)
  await repaired.manager.init()
  assert.equal(repaired.manager.list.data[0].title, '本1')
  assert.equal(repaired.requests.length, 3)
})

test('binary downloads preserve BOM and CRLF for SHA-256 checks', async () => {
  const files = sourceFiles('\uFEFF' + bookText.replaceAll('\n', '\r\n'))
  const manifest = createLibraryManifest(files)
  assert.equal(manifest.files['dat_product.csv'].sha256, createHash('sha256').update(files['dat_product.csv']).digest('hex'))
  assert.equal(
    contentHash(new Uint8Array([0, 255, 128])),
    createHash('sha256')
      .update(new Uint8Array([0, 255, 128]))
      .digest('hex'),
  )
  const manager = new BookManager({
    config,
    storage: new MemoryStorage(),
    api: {
      async get(path, params, options) {
        if (path === '/library-data.json') return { data: manifest }
        const name = path.slice(1)
        assert.equal(options.responseType, 'arraybuffer')
        assert.equal(params.version, manifest.files[name].sha256)
        return { data: Uint8Array.from(files[name]).buffer }
      },
    },
  })
  await manager.init()
  assert.equal(manager.list.data[0].title, '本1')
})

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

function overlappingLoads() {
  const oldBook = deferred()
  const newBook = deferred()
  const started = [deferred(), deferred()]
  const texts = [bookText, bookText.replace('本1', '新しい本')]
  let manifestCalls = 0
  let bookCalls = 0
  const storage = new MemoryStorage()
  const manager = new BookManager({
    config,
    storage,
    api: {
      async get(path) {
        if (path === '/library-data.json') return { data: createLibraryManifest(sourceFiles(texts[manifestCalls++])) }
        if (path === '/dat_folder.csv') return { data: folderText }
        const index = bookCalls++
        started[index].resolve()
        return [oldBook, newBook][index].promise
      },
    },
  })
  return { manager, storage, oldBook, newBook, started, texts }
}

test('late completion of an old load cannot replace a newer reload', async () => {
  const fixture = overlappingLoads()
  const old = fixture.manager.init()
  await fixture.started[0].promise
  const latest = fixture.manager.init({ force: true })
  await fixture.started[1].promise
  fixture.newBook.resolve({ data: fixture.texts[1] })
  await latest
  fixture.oldBook.resolve({ data: fixture.texts[0] })
  await old
  assert.equal(fixture.manager.list.data[0].title, '新しい本')
  assert.equal(fixture.storage.get('version'), createLibraryManifest(sourceFiles(fixture.texts[1])).version)
})

test('failure of an obsolete request cannot reject or reset a newer initialization', async () => {
  const fixture = overlappingLoads()
  const old = fixture.manager.init()
  await fixture.started[0].promise
  const latest = fixture.manager.init({ force: true })
  await fixture.started[1].promise
  fixture.oldBook.reject(new Error('old connection failed'))
  fixture.newBook.resolve({ data: fixture.texts[1] })
  await Promise.all([old, latest])
  assert.equal(fixture.manager.init(), latest)
  assert.equal(fixture.manager.list.data[0].title, '新しい本')
})

test('clearing storage during a pending load does not recreate the cleared cache', async () => {
  const fixture = overlappingLoads()
  const old = fixture.manager.init()
  await fixture.started[0].promise
  fixture.manager.clearStorage()
  fixture.oldBook.resolve({ data: fixture.texts[0] })
  await old
  assert.deepEqual(fixture.manager.list.data, [])
  assert.deepEqual(fixture.storage.get('version'), [])
})

test('unknown folders produce controlled 404 errors and returned lists are safe to sort', async () => {
  const { manager } = setup()
  await manager.init()
  assert.equal(manager.hasFolder('-1'), true)
  assert.equal(manager.hasFolder(['10']), false)
  assert.throws(() => manager.getFolderPath('unknown'), { name: 'FolderNotFoundError', statusCode: 404 })
  await assert.rejects(manager.getBookListForId('unknown'), { statusCode: 404 })
  const books = await manager.getBookListForId('10')
  books.pop()
  assert.equal((await manager.getBookListForId('10')).length, 1)
  assert.deepEqual(manager.getFolderPath('-1'), [{ _id: '-1', name: 'トップ' }])
})

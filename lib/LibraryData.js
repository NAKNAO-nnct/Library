import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex } from '@noble/hashes/utils.js'

export const DATA_FILES = { books: 'dat_product.csv', folders: 'dat_folder.csv' }
export const MANIFEST_SCHEMA_VERSION = 2

export function toBytes(value) {
  if (typeof value === 'string') return new TextEncoder().encode(value)
  if (value instanceof ArrayBuffer) return new Uint8Array(value)
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
  throw new Error('蔵書データの形式が不正です')
}

export function contentHash(value) {
  return bytesToHex(sha256(toBytes(value)))
}

export function cacheHash(table) {
  return contentHash(JSON.stringify(table.toCache()))
}

function validateTable(table, fields, filename) {
  for (const field of fields) {
    if (!table.header.includes(field)) throw new Error(`${filename}: 必須列 ${field} がありません`)
  }
  const ids = new Set()
  for (const row of table.data) {
    if (!row._id || ids.has(row._id)) throw new Error(`${filename}: IDが空、または重複しています: ${row._id}`)
    ids.add(row._id)
  }
}

export function validateLibrary(books, folders) {
  validateTable(books, ['_id', 'parent_id', 'title', 'isbn', 'author', 'publisher'], DATA_FILES.books)
  validateTable(folders, ['_id', 'parent_id', 'name'], DATA_FILES.folders)
  const byId = new Map(folders.data.map((folder) => [folder._id, folder]))
  for (const row of [...books.data, ...folders.data]) {
    if (row.parent_id !== '-1' && !byId.has(row.parent_id)) throw new Error(`親フォルダ ${row.parent_id} がありません`)
  }
  for (const folder of folders.data) {
    const visited = new Set()
    let id = folder._id
    while (id !== '-1') {
      if (visited.has(id)) throw new Error(`フォルダ階層が循環しています: ${id}`)
      visited.add(id)
      id = byId.get(id).parent_id
    }
  }
}

export function validateManifest(manifest) {
  const isHash = (value) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)
  if (
    manifest?.schemaVersion !== MANIFEST_SCHEMA_VERSION ||
    !isHash(manifest.version) ||
    !Number.isSafeInteger(manifest.bookCount) ||
    manifest.bookCount < 0 ||
    !Number.isSafeInteger(manifest.folderCount) ||
    manifest.folderCount < 0 ||
    Object.values(DATA_FILES).some((name) => !isHash(manifest.files?.[name]?.sha256) || !isHash(manifest.files?.[name]?.cacheHash))
  ) {
    throw new Error('蔵書データの更新情報が不正です。配信状態を確認してください。')
  }
}

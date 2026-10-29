import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Tsv from '../lib/Tsv.js'

const rootDirectory = fileURLToPath(new URL('../', import.meta.url))
const filenames = ['dat_product.csv', 'dat_folder.csv']

function validateTable(table, required, filename) {
  for (const field of required) {
    if (!table.header.includes(field)) throw new Error(`${filename}: 必須列 ${field} がありません`)
  }
  const ids = new Set()
  for (const row of table.data) {
    if (!row._id || ids.has(row._id)) throw new Error(`${filename}: IDが空、または重複しています: ${row._id}`)
    ids.add(row._id)
  }
}

export function createLibraryManifest(files) {
  const tables = {}
  for (const name of filenames) {
    if (!files[name]) throw new Error(`public/${name} がありません`)
    tables[name] = new Tsv(new TextDecoder('utf-8', { fatal: true }).decode(files[name]))
  }
  const books = tables['dat_product.csv']
  const folders = tables['dat_folder.csv']
  validateTable(books, ['_id', 'parent_id', 'title', 'isbn', 'author', 'publisher'], 'dat_product.csv')
  validateTable(folders, ['_id', 'parent_id', 'name'], 'dat_folder.csv')
  const folderMap = new Map(folders.data.map((folder) => [folder._id, folder]))
  for (const row of [...books.data, ...folders.data]) {
    if (row.parent_id !== '-1' && !folderMap.has(row.parent_id)) throw new Error(`親フォルダ ${row.parent_id} がありません`)
  }
  for (const folder of folders.data) {
    const visited = new Set()
    let id = folder._id
    while (id !== '-1') {
      if (visited.has(id)) throw new Error(`フォルダ階層が循環しています: ${id}`)
      visited.add(id)
      id = folderMap.get(id).parent_id
    }
  }
  const hash = createHash('sha256')
  for (const name of filenames) hash.update(name).update(files[name])
  return { version: hash.digest('hex'), bookCount: books.data.length, folderCount: folders.data.length }
}

export async function prepareLibrary(root = rootDirectory) {
  const source = join(root, 'public')
  const files = Object.fromEntries(await Promise.all(filenames.map(async (name) => [name, await readFile(join(source, name))])))
  const manifest = createLibraryManifest(files)
  await writeFile(join(source, 'library-data.json'), JSON.stringify(manifest, null, 2) + '\n')
  console.log(`蔵書 ${manifest.bookCount}件・フォルダ ${manifest.folderCount}件を確認しました。`)
  return manifest
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await prepareLibrary()

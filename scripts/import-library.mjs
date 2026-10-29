import { createHash } from 'node:crypto'
import { readFile, readdir, mkdir, writeFile, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { unzipSync } from 'fflate'
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

export function readLibraryArchive(bytes) {
  // Extract only the two known data files; never use ZIP paths as output paths.
  const files = unzipSync(bytes, { filter: (entry) => filenames.includes(entry.name) })
  const tables = {}
  for (const name of filenames) {
    if (!files[name]) throw new Error(`ZIP内に ${name} がありません`)
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
  return {
    files,
    manifest: { version: hash.digest('hex'), bookCount: books.data.length, folderCount: folders.data.length },
  }
}

export async function importLibrary(root = rootDirectory) {
  const archives = (await readdir(root)).filter((name) => name.normalize('NFC') === '蔵書マネージャー.zip')
  if (archives.length !== 1) throw new Error('ルートに「蔵書マネージャー.zip」を1つ置いてください')
  const { files, manifest } = readLibraryArchive(await readFile(join(root, archives[0])))
  const output = join(root, 'public')
  await mkdir(output, { recursive: true })
  for (const name of filenames) await writeFile(join(output, name), files[name])
  await writeFile(join(output, 'library-data.json'), JSON.stringify(manifest, null, 2) + '\n')
  await rm(join(output, 'dat_book.csv'), { force: true })
  console.log(`蔵書 ${manifest.bookCount}件・フォルダ ${manifest.folderCount}件をZIPから取り込みました。`)
  return manifest
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await importLibrary()

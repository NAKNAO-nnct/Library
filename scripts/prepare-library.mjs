import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Tsv from '../lib/Tsv.js'
import { DATA_FILES, MANIFEST_SCHEMA_VERSION, contentHash, cacheHash, validateLibrary } from '../lib/LibraryData.js'

const rootDirectory = fileURLToPath(new URL('../', import.meta.url))
const filenames = Object.values(DATA_FILES)

export function createLibraryManifest(files) {
  const tables = {}
  for (const name of filenames) {
    if (!files[name]) throw new Error(`public/${name} がありません`)
    tables[name] = new Tsv(new TextDecoder('utf-8', { fatal: true }).decode(files[name]))
  }
  const books = tables['dat_product.csv']
  const folders = tables['dat_folder.csv']
  validateLibrary(books, folders)
  const hash = createHash('sha256')
  for (const name of filenames) hash.update(name).update(files[name])
  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    version: hash.digest('hex'),
    bookCount: books.data.length,
    folderCount: folders.data.length,
    files: Object.fromEntries(filenames.map((name) => [name, { sha256: contentHash(files[name]), cacheHash: cacheHash(tables[name]) }])),
  }
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

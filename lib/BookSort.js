const names = new Intl.Collator('ja', { numeric: true })

export function sortFolders(folders) {
  return [...folders].sort((a, b) => names.compare(a.name, b.name))
}

export function sortBooksByIsbn(books) {
  return [...books].sort((a, b) => a.isbn.localeCompare(b.isbn))
}

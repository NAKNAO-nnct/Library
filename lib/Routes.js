export function singleFolderId(value) {
  return typeof value === 'string' && value.length > 0 ? value : null
}

export function parseIsbnList(value) {
  if (typeof value !== 'string' || !value) return null
  const isbns = value.split(',').map((isbn) => isbn.trim().replace(/-/g, '').toUpperCase())
  if (isbns.some((isbn) => !/^(?:\d{13}|\d{9}[\dX])$/.test(isbn))) return null
  return [...new Set(isbns)]
}

export function bookListDestination(books) {
  const isbns = [...new Set(books.map((book) => book.isbn).filter(Boolean))]
  return isbns.length ? '/book/' + isbns.join(',') : '/'
}

export function legacyRedirectPath(value, baseURL = '/') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || [...value].some((character) => character.charCodeAt(0) < 32)) return '/'
  let path = value
  if (baseURL !== '/' && path.startsWith(baseURL)) path = '/' + path.slice(baseURL.length)
  if (path === '/redirect' || path.startsWith('/redirect?')) return '/'
  return path
}

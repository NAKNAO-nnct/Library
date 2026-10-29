export function mergeBookDetails(isbns, localBooks, apiBooks = []) {
  const local = new Map(localBooks.map((book) => [book.isbn, book]))
  const remote = new Map(apiBooks.filter((book) => book?.summary).map((book) => [book.summary.isbn, book]))
  return isbns.flatMap((isbn) => {
    const source = local.get(isbn)
    const api = remote.get(isbn)
    if (!source && !api) return []
    return [
      {
        isbn,
        title: source?.title || api?.summary.title || isbn,
        author: source?.author || api?.summary.author || '',
        publisher: source?.publisher || api?.summary.publisher || '',
        sales_date: source?.sales_date || '',
        cover: source?.large_image_url || source?.medium_image_url || source?.small_image_url || api?.summary.cover || '',
      },
    ]
  })
}

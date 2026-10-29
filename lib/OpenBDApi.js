import Api from './APIUtil.js'

export class OpenBdApi {
  constructor(api = new Api('https://api.openbd.jp')) {
    this.api = api
  }

  getBookData(isbn, options = {}) {
    return this.api.get('/v1/get', { isbn }, options)
  }

  formatData(data) {
    if (!Array.isArray(data)) throw new Error('OpenBDのレスポンスが不正です')
    return data
      .filter((book) => book?.summary?.isbn)
      .map((book) => {
        const { isbn, cover } = book.summary
        return {
          ...book,
          summary: {
            ...book.summary,
            cover: cover || `https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/${isbn.slice(-4)}/${isbn}.jpg`,
          },
        }
      })
  }
}

export default new OpenBdApi()

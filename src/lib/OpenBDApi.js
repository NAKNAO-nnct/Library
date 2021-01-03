import Api from './APIUtil'

class OpenBb {
  constructor() {
    this.openbd = new Api('https://api.openbd.jp')
  }

  getBookData(isbn) {
    return this.openbd.get('/v1/get', {
      isbn,
    })
  }

  formatData(data) {
    for (let i = 0; i < data.length; i++) {
      const isbn = data[i].summary.isbn
      if (data[i].summary.cover === '') {
        data[i].summary.cover =
          'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/' +
          isbn.slice(-4) +
          '/' +
          isbn +
          '.jpg'
      }
    }
    return data
  }
}

export default new OpenBb()

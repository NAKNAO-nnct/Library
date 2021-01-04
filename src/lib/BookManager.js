import Api from './APIUtil'
import Tsv from './Tsv'
import LocalStorage from './LocalStorage'
import conf from './config'

class BookManager {
  constructor() {
    this.book = new Api('')
  }

  async init() {
    let flg = 0
    if (LocalStorage.get(conf.LOCALSTORAGE_BOOKLIST_KEY).length === 0) {
      await this.book.get('/dat_book.csv').then((response) => {
        this.list = new Tsv(response.data)
        LocalStorage.set(conf.LOCALSTORAGE_BOOKLIST_KEY, this.list)
        flg += 1
      })
    } else {
      this.list = LocalStorage.get(conf.LOCALSTORAGE_BOOKLIST_KEY)
      flg += 1
    }

    if (LocalStorage.get(conf.LOCALSTORAGE_FOLDERLIST_KEY).length === 0) {
      await this.book.get('/dat_folder.csv').then((response) => {
        this.footer = new Tsv(response.data)
        LocalStorage.set(conf.LOCALSTORAGE_FOLDERLIST_KEY, this.footer)
        flg += 1
      })
    } else {
      this.footer = LocalStorage.get(conf.LOCALSTORAGE_FOLDERLIST_KEY)
      flg += 1
    }
    return flg
  }

  clear() {
    this.book = undefined
    this.footer = undefined
  }

  async getFolderListForId(fid) {
    return await this.init().then(() => {
      return this.footer.data.filter((e) => e.parent_id === fid)
    })
  }

  async getBookListForId(fid) {
    return await this.init().then(() => {
      return this.list.data.filter((e) => e.parent_id === fid)
    })
  }
}

export default new BookManager()

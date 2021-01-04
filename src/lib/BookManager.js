import Api from './APIUtil'
import Tsv from './Tsv'
import LocalStorage from './LocalStorage'
import conf from './config'

class BookManager {
  constructor() {
    this.book = new Api('')
  }

  initTree() {
    this.tree = []
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
        this.folder = new Tsv(response.data)
        LocalStorage.set(conf.LOCALSTORAGE_FOLDERLIST_KEY, this.folder)
        flg += 1
      })
    } else {
      this.folder = LocalStorage.get(conf.LOCALSTORAGE_FOLDERLIST_KEY)
      flg += 1
    }
    return flg
  }

  clear() {
    this.book = undefined
    this.folder = undefined
  }

  async getFolderListForId(fid) {
    return await this.init().then(() => {
      return this.folder.data.filter((e) => e.parent_id === fid)
    })
  }

  async getBookListForId(fid) {
    return await this.init().then(() => {
      return this.list.data.filter((e) => e.parent_id === fid)
    })
  }

  getFolderListForIdSync(fid) {
    if (fid === '-1') {
      this.tree.push({
        text: 'トップ',
        to: '/folder/-1',
        disabled: this.tree.length === 0,
      })
      return fid
    }
    const tmpFolder = this.folder.data.filter((e) => e._id === fid)[0]
    this.tree.push({
      text: tmpFolder.name,
      to: '/folder/' + tmpFolder._id,
      disabled: this.tree.length === 0,
    })
    return this.getFolderListForIdSync(tmpFolder.parent_id)
  }

  getTreeStructure(fid) {
    this.initTree()
    if (this.getFolderListForIdSync(fid) === '-1') {
      return this.tree.reverse()
    }
  }
}

export default new BookManager()

class LocalStorage {
  constructor() {
    this.data = {}
  }

  init() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      this.data[key] = JSON.parse(localStorage.getItem(key)) || []
    }
  }

  get(key) {
    this.init()
    return JSON.parse(this.data[key] || '[]')
  }

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  remove(key) {
    localStorage.removeItem(key)
  }

  clear() {
    localStorage.clear()
  }

  all() {
    this.init()
    return this.data
  }
}

const localstorage = new LocalStorage()
export default localstorage

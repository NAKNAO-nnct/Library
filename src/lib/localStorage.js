class LocalStorage {
  constructor() {
    this.data = {}
  }

  refresh() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      this.data[key] = JSON.parse(localStorage.getItem(key)) || []
    }
  }

  get(key) {
    this.refresh()
    return this.data[key] || []
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
    this.refresh()
    return this.data
  }
}

export default new LocalStorage()

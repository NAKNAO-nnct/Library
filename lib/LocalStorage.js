class LocalStorage {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? []
    } catch {
      return []
    }
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
    return Object.fromEntries(
      Array.from({ length: localStorage.length }, (_, index) => {
        const key = localStorage.key(index)
        return [key, this.get(key)]
      }),
    )
  }
}

export default new LocalStorage()

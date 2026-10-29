import cookie from 'js-cookie'

class CookieStorage {
  get(key) {
    return cookie.get(key)
  }

  set(key, value, params = {}) {
    cookie.set(key, value, params)
  }

  remove(key) {
    cookie.remove(key)
  }
}

export default new CookieStorage()

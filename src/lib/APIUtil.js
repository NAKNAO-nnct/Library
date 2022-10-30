import axios from 'axios'

export default class ApiUtils {
  constructor(baseURL) {
    this.consols = axios.create({
      baseURL,
    })
  }

  get(path, params = {}) {
    params._ = Date.now()
    return this.consols.get(path, { params })
  }

  post(path, params = {}) {
    return this.consols.post(path, { params })
  }
}

import axios from 'axios'

export default class ApiClient {
  constructor(baseURL = '', options = {}) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      ...options,
    })
  }

  get(path, params = {}, options = {}) {
    const { cacheBust = false, ...requestOptions } = options
    return this.client.get(path, {
      ...requestOptions,
      params: cacheBust ? { ...params, _: Date.now() } : { ...params },
    })
  }
}

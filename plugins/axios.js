import axios from 'axios'

export default defineNuxtPlugin(() => {
  const client = axios.create()
  client.interceptors.request.use((config) => {
    console.log('axiosリクエスト発生 url=' + config.url)
    return config
  })
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 400) {
        return navigateTo('/400')
      }
      return Promise.reject(error)
    },
  )
  return { provide: { axios: client } }
})

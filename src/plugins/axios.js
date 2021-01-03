export default function ({ $axios, redirect }) {
  $axios.onRequest((config) => {
    // eslint-disable-next-line no-console
    console.log('axiosリクエスト発生 url=' + config.url)
  })

  $axios.onError((error) => {
    // axiosの通信でエラーが発生した時に 400エラーページにリダイレクト
    const code = parseInt(error.response && error.response.status)
    if (code === 400) {
      redirect('/400')
    }
  })
}

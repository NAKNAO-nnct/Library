export default class Tsv {
  constructor(strData) {
    const arryData = strData.split('\n')
    const length = arryData.length
    this.header = arryData.slice(0, 1)[0].split('\t')
    this.body = arryData.slice(1).map((e) => {
      return e.split('\t')
    })
    this.data = []

    this.body.forEach((row) => {
      const tmpJson = {}
      for (let i = 0; i < length; i++) {
        tmpJson[this.header[i]] = row[i]
      }
      this.data.push(tmpJson)
    })
  }
}

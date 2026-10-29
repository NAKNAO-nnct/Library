import Papa from 'papaparse'

export default class Tsv {
  constructor(source) {
    let rows = source
    if (typeof source === 'string') {
      const result = Papa.parse(source.replace(/^\uFEFF/, ''), { delimiter: '\t', skipEmptyLines: 'greedy' })
      if (result.errors.length) throw new Error(`TSVの読込に失敗しました: ${result.errors[0].message}`)
      rows = result.data
    }
    if (!Array.isArray(rows) || !rows.length || !Array.isArray(rows[0])) throw new Error('TSVのヘッダーがありません')
    this.header = rows[0]
    if (this.header.some((key) => !key) || new Set(this.header).size !== this.header.length) throw new Error('TSVのヘッダーが不正です')
    this.body = rows.slice(1)
    this.data = this.body.map((row, index) => {
      if (!Array.isArray(row) || row.length !== this.header.length) throw new Error(`TSVの${index + 2}行目の列数が一致しません`)
      return Object.fromEntries(this.header.map((key, column) => [key, row[column]]))
    })
  }

  // Store each value once to stay within browser storage limits.
  toCache() {
    return { header: this.header, body: this.body }
  }
}

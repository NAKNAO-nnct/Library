import assert from 'node:assert/strict'
import { test } from 'node:test'
import ApiClient from '../lib/APIUtil.js'
import { OpenBdApi } from '../lib/OpenBDApi.js'
import { singleFolderId, bookListDestination, parseIsbnList, legacyRedirectPath } from '../lib/Routes.js'
import { sortBooksByIsbn, sortFolders } from '../lib/BookSort.js'

test('missing or repeated folder query values never create an empty book URL', () => {
  for (const value of [undefined, null, '', ['10', '20']]) assert.equal(singleFolderId(value), null)
  assert.equal(singleFolderId('10'), '10')
  assert.equal(bookListDestination([]), '/')
  assert.equal(bookListDestination([{ isbn: '' }]), '/')
  assert.equal(bookListDestination([{ isbn: '9780000000001' }, { isbn: '9780000000001' }]), '/book/9780000000001')
})

test('ISBN route values are normalized, deduplicated, and validated', () => {
  assert.deepEqual(parseIsbnList('978-4-04-685813-9,9784046858139'), ['9784046858139'])
  assert.deepEqual(parseIsbnList('123456789x'), ['123456789X'])
  for (const value of [undefined, [], '', 'bad', '9784046858139,', '12345678901234']) assert.equal(parseIsbnList(value), null)
})

test('legacy redirect handles missing/repeated query values and keeps paths local', () => {
  for (const value of [undefined, null, ['x'], '//example.com', '/\\example.com', '/redirect?p=/redirect', '/\nfoo']) {
    assert.equal(legacyRedirectPath(value), '/')
  }
  assert.equal(legacyRedirectPath('/folder/10'), '/folder/10')
  assert.equal(legacyRedirectPath('/library/folder/10', '/library/'), '/folder/10')
  assert.equal(legacyRedirectPath('/folder/library/10', '/library/'), '/folder/library/10')
})

test('ISBN sort uses the correct field, preserves equal-key order, and does not mutate data', () => {
  const rows = [
    { _id: 'a', isbn: '9780000000002' },
    { _id: 'b', isbn: '9780000000001' },
    { _id: 'c', isbn: '9780000000001' },
  ]
  assert.deepEqual(
    sortBooksByIsbn(rows).map((row) => row._id),
    ['b', 'c', 'a'],
  )
  assert.deepEqual(
    rows.map((row) => row._id),
    ['a', 'b', 'c'],
  )
  assert.deepEqual(
    sortFolders([{ name: '本棚10' }, { name: '本棚2' }]).map((row) => row.name),
    ['本棚2', '本棚10'],
  )
})

test('shared HTTP client preserves caller parameters and supports timeout, binary data, and cancellation', async () => {
  const requests = []
  const api = new ApiClient('', {
    adapter: async (config) => {
      requests.push(config)
      return { data: 'ok', status: 200, statusText: 'OK', headers: {}, config }
    },
  })
  const params = Object.freeze({ isbn: '9784046858139' })
  await api.get('/v1/get', params)
  assert.deepEqual(requests[0].params, params)
  assert.equal(requests[0].timeout, 10000)
  await api.get('/library-data.json', params, { cacheBust: true, responseType: 'arraybuffer' })
  assert.equal(requests[1].responseType, 'arraybuffer')
  assert.equal(typeof requests[1].params._, 'number')
  assert.deepEqual(params, { isbn: '9784046858139' })
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(api.get('/v1/get', {}, { signal: controller.signal }), { code: 'ERR_CANCELED' })
})

test('OpenBD enrichment filters null records and never mutates the original response', () => {
  const source = [{ summary: { isbn: '9784046858139', cover: '' } }, null]
  const api = new OpenBdApi()
  const formatted = api.formatData(source)
  assert.equal(formatted.length, 1)
  assert.match(formatted[0].summary.cover, /8139\/9784046858139\.jpg$/)
  assert.equal(source[0].summary.cover, '')
  assert.throws(() => api.formatData({ error: 'unavailable' }), /レスポンス/)
})

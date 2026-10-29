import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createVuetify } from 'vuetify'
import { THEME_STORAGE_KEY, getThemePreference, saveThemePreference } from '../lib/ThemePreference.js'
import { BookManager } from '../lib/BookManager.js'

function memoryStorage() {
  const values = new Map()
  return {
    get: (key) => values.get(key),
    set: (key, value) => values.set(key, value),
    remove: (key) => values.delete(key),
  }
}

test('first visit uses light; switching to dark is restored on the next visit', async () => {
  const storage = memoryStorage()
  const firstVisit = createVuetify({ theme: { defaultTheme: getThemePreference(storage) } })
  assert.equal(firstVisit.theme.global.current.value.dark, false)
  await firstVisit.theme.change('dark')
  assert.equal(firstVisit.theme.global.current.value.dark, true)
  assert.equal(saveThemePreference(firstVisit.theme.global.name.value, storage), true)
  const nextVisit = createVuetify({ theme: { defaultTheme: getThemePreference(storage) } })
  assert.equal(nextVisit.theme.global.current.value.dark, true)
  await nextVisit.theme.change('light')
  saveThemePreference(nextVisit.theme.global.name.value, storage)
  assert.equal(getThemePreference(storage), 'light')
})

test('invalid preferences fall back to light, and clearing book caches preserves the chosen theme', () => {
  const storage = memoryStorage()
  storage.set(THEME_STORAGE_KEY, 'unknown')
  assert.equal(getThemePreference(storage), 'light')
  saveThemePreference('dark', storage)
  new BookManager({ storage }).clearStorage()
  assert.equal(getThemePreference(storage), 'dark')
  const unavailable = {
    set() {
      throw new Error('storage disabled')
    },
  }
  assert.equal(saveThemePreference('light', unavailable), false)
})

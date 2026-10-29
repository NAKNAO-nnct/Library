import LocalStorage from './LocalStorage.js'

export const THEME_STORAGE_KEY = 'LibraryThemePreference'

export function getThemePreference(storage = LocalStorage) {
  return storage.get(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light'
}

export function saveThemePreference(theme, storage = LocalStorage) {
  if (theme !== 'light' && theme !== 'dark') return false
  try {
    storage.set(THEME_STORAGE_KEY, theme)
    return true
  } catch {
    // Switching themes remains available when browser storage is disabled.
    return false
  }
}

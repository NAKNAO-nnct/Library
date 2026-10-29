export default defineNuxtConfig({
  compatibilityDate: '2026-10-29',
  // Use root-level pages, layouts, components, and plugins.
  srcDir: '.',
  ssr: false,
  devtools: { enabled: false },
  devServer: { port: 3000, host: '0.0.0.0' },
  app: {
    head: {
      title: '蔵書リスト',
      htmlAttrs: { lang: 'ja' },
      meta: [{ name: 'description', content: '' }],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },
  css: ['vuetify/styles', '@mdi/font/css/materialdesignicons.css'],
  modules: ['@nuxt/eslint'],
  build: { transpile: ['vuetify'] },
  vite: {
    define: {
      'process.env.LOCALSTORAGE_BOOKLIST_KEY': JSON.stringify(process.env.LOCALSTORAGE_BOOKLIST_KEY ?? 'BookListKey'),
      'process.env.LOCALSTORAGE_FOLDERLIST_KEY': JSON.stringify(process.env.LOCALSTORAGE_FOLDERLIST_KEY ?? 'FolderListKey'),
      'process.env.LOCALSTORAGE_DATAVERSION_KEY': JSON.stringify(process.env.LOCALSTORAGE_DATAVERSION_KEY ?? 'LibraryDataVersion'),
    },
  },
})

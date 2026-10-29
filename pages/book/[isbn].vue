<template>
  <div>
    <p v-if="!books.length && loadingSupplement">書籍情報を取得しています。</p>
    <p v-else-if="!books.length">書籍情報が見つかりません。</p>
    <div v-for="book in books" :key="book.isbn">
      <v-card>
        <v-container>
          <v-row>
            <v-col cols="4">
              <img v-if="book.cover" :src="book.cover" :alt="book.title" style="width: 100%" >
              <v-icon v-else size="96" aria-label="表紙画像なし">mdi-book-open-page-variant-outline</v-icon>
            </v-col>
            <v-col cols="8">
              <v-card-title>
                {{ book.title }}
              </v-card-title>
              <v-card-subtitle>{{ book.author }}</v-card-subtitle>
              <v-card-text>
                <div>{{ book.publisher }}</div>
                <div>{{ book.sales_date }}</div>
                <div>ISBN: {{ book.isbn }}</div>
              </v-card-text>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
      <br >
    </div>
  </div>
</template>

<script setup>
import BookApi from '~/lib/OpenBDApi'
import BookManage from '~/lib/BookManager'
import { mergeBookDetails } from '~/lib/BookDetails'
import { parseIsbnList } from '~/lib/Routes'

definePageMeta({ key: (route) => route.fullPath })
const route = useRoute()
const isbns = parseIsbnList(route.params.isbn)
if (!isbns) throw createError({ statusCode: 400, statusMessage: 'Invalid ISBN' })
await BookManage.init()
const localBooks = BookManage.list.data
const local = new Map(localBooks.map((book) => [book.isbn, book]))
const missingCovers = isbns.filter((isbn) => {
  const book = local.get(isbn)
  return !(book?.large_image_url || book?.medium_image_url || book?.small_image_url)
})
const books = ref(mergeBookDetails(isbns, localBooks))
const loadingSupplement = ref(missingCovers.length > 0)
const controller = new AbortController()
onBeforeUnmount(() => controller.abort())
onMounted(async () => {
  if (!missingCovers.length) return
  try {
    const response = await BookApi.getBookData(missingCovers.join(','), { signal: controller.signal })
    if (controller.signal.aborted) return
    const apiBooks = BookApi.formatData(response.data)
    books.value = mergeBookDetails(isbns, localBooks, apiBooks)
  } catch (error) {
    if (!controller.signal.aborted) console.warn('OpenBDから補足情報を取得できないため、元データを表示します。', error)
  } finally {
    loadingSupplement.value = false
  }
})
</script>

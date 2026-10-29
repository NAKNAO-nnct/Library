<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card-title class="d-flex align-center ga-4 flex-wrap">
          蔵書一覧
          <v-spacer />
          <v-text-field v-model="search" append-inner-icon="mdi-magnify" label="検索" single-line hide-details />
        </v-card-title>
        <v-data-table
          v-model:expanded="expanded"
          :headers="headers"
          :items="items.data"
          :search="search"
          :items-per-page="-1"
          class="elevation-1"
          item-value="_id"
        >
          <template #[`item.isbn`]="{ item }">
            <a :href="`/book/${item.isbn}`"> {{ item.isbn }} </a>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import LocalStorage from '~/lib/LocalStorage'
import BookManage from '~/lib/BookManager'
import conf from '~/lib/config'

const search = ref('')
const expanded = ref([])
const headers = [
  { title: 'タイトル', key: 'title' },
  { title: '著者', key: 'author' },
  { title: '出版社', key: 'publisher' },
  { title: '発売日', key: 'sales_date' },
  { title: 'タイプ', key: 'size' },
  { title: 'ISBN', key: 'isbn' },
]
await BookManage.init()
const items = LocalStorage.get(conf.LOCALSTORAGE_BOOKLIST_KEY)
</script>

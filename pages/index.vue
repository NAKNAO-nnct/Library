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
          :headers="headers"
          :items="items.data"
          :search="search"
          :items-per-page="50"
          :items-per-page-options="[25, 50, 100]"
          class="elevation-1"
          item-value="_id"
        >
          <template #[`item.isbn`]="{ item }">
            <NuxtLink :to="`/book/${item.isbn}`">{{ item.isbn }}</NuxtLink>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import BookManage from '~/lib/BookManager'

const search = ref('')
const headers = [
  { title: 'タイトル', key: 'title' },
  { title: '著者', key: 'author' },
  { title: '出版社', key: 'publisher' },
  { title: '発売日', key: 'sales_date' },
  { title: 'タイプ', key: 'size' },
  { title: 'ISBN', key: 'isbn' },
]
await BookManage.init()
const items = BookManage.list
</script>

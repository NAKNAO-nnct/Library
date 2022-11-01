<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card-title>
          蔵書一覧
          <v-spacer></v-spacer>
          <v-text-field v-model="search" append-icon="mdi-magnify" label="検索" single-line hide-details></v-text-field>
        </v-card-title>
        <v-data-table :headers="headers" :items="items.data" :search="search" :items-per-page="-1" :expanded.sync="expanded" class="elevation-1">
          <template v-slot:[`item.isbn`]="{ item }">
            <a :href="`/book/${item.isbn}`"> {{ item.isbn }} </a>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import LocalStorage from '~/lib/LocalStorage'
// import CookieStorage from '~/lib/CookieStorage'
// import Api from '~/lib/APIUtil'
// import BookApi from '~/lib/OpenBDApi'
import BookManage from '~/lib/BookManager'
import conf from '~/lib/config'

export default {
  async asyncData() {
    const items = await BookManage.init().then(() => {
      return LocalStorage.get(conf.LOCALSTORAGE_BOOKLIST_KEY)
    })
    return { items }
  },
  data() {
    return {
      search: '',
      expanded: [],
      headers: [
        {
          text: 'タイトル',
          value: 'title',
        },
        {
          text: '著者',
          value: 'author',
        },
        {
          text: '出版社',
          value: 'publisher',
        },
        {
          text: '発売日',
          value: 'sales_date',
        },
        {
          text: 'タイプ',
          value: 'size',
        },
        {
          text: 'ISBN',
          value: 'isbn',
        },
      ],
      items: {
        body: [],
        data: [],
        head: [],
      },
    }
  },
}
</script>

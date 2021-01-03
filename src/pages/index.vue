<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card-title>
          蔵書一覧
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="検索"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>
        <v-data-table :headers="headers" :items="items.data" :search="search">
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
    if (LocalStorage.get(conf.LOCALSTORAGE_BOOKLIST_KEY).length === 0) {
      return {
        items: await BookManage.init().then((reseponse) => {
          return BookManage.list
        }),
      }
    } else {
      return { items: LocalStorage.get(conf.LOCALSTORAGE_BOOKLIST_KEY) }
    }
  },
  data() {
    return {
      test: 'hoe',
      search: '',
      headers: [
        {
          text: 'id',
          value: '_id',
        },
        {
          text: 'title',
          value: 'title',
        },
        {
          text: 'isbn',
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

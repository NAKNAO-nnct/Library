<template>
  <v-expansion-panels>
    <v-expansion-panel>
      <v-expansion-panel-header>
        <span> <v-icon>mdi-database-outline</v-icon> ストレージ </span>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        LocalStorageのデータをクリアします。
        <v-btn block @click="clearStorage"> LocalStorageのデータをクリア </v-btn>
      </v-expansion-panel-content>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-header>
        <span> <v-icon>mdi-book-sync-outline</v-icon> 蔵書データ </span>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        蔵書データ(CSV)をロードする。
        <v-btn block @click="reload"> リロード </v-btn>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import conf from '~/lib/config'
import LocalStorage from '~/lib/LocalStorage'
import BookManage from '~/lib/BookManager'

export default {
  methods: {
    clearStorage() {
      LocalStorage.remove(conf.LOCALSTORAGE_BOOKLIST_KEY)
      LocalStorage.remove(conf.LOCALSTORAGE_FOLDERLIST_KEY)
      BookManage.clear()
    },
    reload() {
      window.location.reload()
    },
  },
}
</script>

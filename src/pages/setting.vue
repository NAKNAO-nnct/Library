<template>
  <v-expansion-panels>
    <v-expansion-panel>
      <v-expansion-panel-header> ストレージクリア </v-expansion-panel-header>
      <v-expansion-panel-content>
        LocalStorageのデータをクリアします。
        <v-btn block @click="clearStorage"> データクリア </v-btn>
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
      location.reload()
    },
  },
}
</script>

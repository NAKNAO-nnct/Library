<template>
  <v-expansion-panels>
    <v-expansion-panel>
      <v-expansion-panel-title>
        <span> <v-icon>mdi-database-outline</v-icon> ストレージ </span>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        LocalStorageのデータをクリアします。
        <v-btn block @click="clearStorage"> LocalStorageのデータをクリア </v-btn>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-title>
        <span> <v-icon>mdi-book-sync-outline</v-icon> 蔵書データ </span>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        配信中の蔵書データを再取得します。
        <v-btn block :loading="reloading" @click="reload"> リロード </v-btn>
        <p v-if="reloadError" role="alert">{{ reloadError }}</p>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import BookManage from '~/lib/BookManager'

export default {
  data() {
    return { reloading: false, reloadError: '' }
  },
  methods: {
    clearStorage() {
      BookManage.clearStorage()
    },
    async reload() {
      this.reloading = true
      this.reloadError = ''
      try {
        await BookManage.init({ force: true })
        window.location.reload()
      } catch {
        this.reloadError = '蔵書データを再取得できませんでした。接続を確認して再試行してください。'
      } finally {
        this.reloading = false
      }
    },
  },
}
</script>

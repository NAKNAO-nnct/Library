<template>
  <v-card rounded="0">
    <v-breadcrumbs :items="tree">
      <template #divider>
        <v-icon>mdi-chevron-right</v-icon>
      </template>
    </v-breadcrumbs>
    <v-list class="v-list">
      <v-list-item v-for="(item, i) in folders" :key="'folder_' + i" :to="`/folder/${item._id}`" class="tile">
        <template #prepend>
          <v-icon color="info">mdi-folder-open</v-icon>
        </template>

        <v-list-item-title>{{ item.name }}</v-list-item-title>
      </v-list-item>
      <v-list-item v-for="(item, i) in books" :key="'book_' + i" :to="`/book/${item.isbn}`">
        <template #prepend>
          <v-icon>mdi-book-open-page-variant-outline</v-icon>
        </template>

        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
import BookManage from '~/lib/BookManager'

definePageMeta({ key: (route) => route.fullPath })
const route = useRoute()
const fid = route.params.fid
const folders = (await BookManage.getFolderListForId(fid)).sort((a, b) => (a.name < b.name ? -1 : 1))
const books = (await BookManage.getBookListForId(fid)).sort((a, b) => (a.ibsn < b.ibsn ? -1 : 1))
const tree = BookManage.getTreeStructure(fid).map(({ text, ...item }) => ({ title: text, ...item }))
</script>

<style scoped>
.tile {
  background-color: rgb(255 255 255 / 10%);
}

.v-list {
  padding: 0;
}
</style>

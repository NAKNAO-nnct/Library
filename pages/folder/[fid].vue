<template>
  <v-card rounded="0">
    <v-breadcrumbs :items="tree">
      <template #divider>
        <v-icon>mdi-chevron-right</v-icon>
      </template>
    </v-breadcrumbs>
    <v-list class="v-list">
      <v-list-item v-for="item in folders" :key="'folder_' + item._id" :to="`/folder/${item._id}`" class="bg-surface-light">
        <template #prepend>
          <v-icon color="info">mdi-folder-open</v-icon>
        </template>

        <v-list-item-title>{{ item.name }}</v-list-item-title>
      </v-list-item>
      <v-list-item v-for="item in books" :key="'book_' + item._id" :to="`/book/${item.isbn}`">
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
import { sortFolders, sortBooksByIsbn } from '~/lib/BookSort'

definePageMeta({ key: (route) => route.fullPath })
const route = useRoute()
const fid = route.params.fid
await BookManage.init()
if (!BookManage.hasFolder(fid)) throw createError({ statusCode: 404, statusMessage: 'Folder not found' })
const folders = sortFolders(await BookManage.getFolderListForId(fid))
const books = sortBooksByIsbn(await BookManage.getBookListForId(fid))
const tree = BookManage.getFolderPath(fid).map((folder, index, path) => ({
  title: folder.name,
  to: '/folder/' + folder._id,
  disabled: index === path.length - 1,
}))
</script>

<style scoped>
.v-list {
  padding: 0;
}
</style>

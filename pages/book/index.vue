<template>
  <div />
</template>

<script setup>
import BookManage from '~/lib/BookManager'
import { singleFolderId, bookListDestination } from '~/lib/Routes'

definePageMeta({ key: (route) => route.fullPath })
const route = useRoute()
const fid = singleFolderId(route.query.fid)
if (fid) {
  await BookManage.init()
  if (!BookManage.hasFolder(fid)) throw createError({ statusCode: 404, statusMessage: 'Folder not found' })
  const books = await BookManage.getBookListForId(fid)
  await navigateTo(bookListDestination(books), { replace: true })
} else {
  await navigateTo('/', { replace: true })
}
</script>

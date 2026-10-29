<template>
  <div />
</template>

<script setup>
import BookManage from '~/lib/BookManager'

const route = useRoute()
const fid = route.query.fid
if (fid !== null) {
  const books = await BookManage.getBookListForId(fid)
  await navigateTo('/book/' + books.map((book) => book.isbn).join(','), { replace: true })
} else {
  await navigateTo('/', { replace: true })
}
</script>

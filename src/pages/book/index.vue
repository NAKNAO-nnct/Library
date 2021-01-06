<template>
  <div></div>
</template>

<script>
import BookManage from '~/lib/BookManager'

export default {
  async asyncData({ route, redirect }) {
    const fid = route.query.fid
    if (fid !== null) {
      const isbn = await BookManage.getBookListForId(fid).then((response) => {
        return response.map((x) => x.isbn).join(',')
      })
      return redirect('/book/' + isbn)
    } else {
      return redirect('/')
    }
  },
}
</script>

<template>
  <div>
    <div v-for="book in books" :key="book.title">
      <v-card>
        <v-container>
          <v-row>
            <v-col cols="4">
              <img :src="book.summary.cover" style="width: 100%" />
            </v-col>
            <v-col cols="8">
              <v-card-title>
                {{ book.summary.title }} &emsp;
                {{ book.onix.DescriptiveDetail.TitleDetail.TitleElement.PartNumber }}
              </v-card-title>
              <v-card-subtitle>{{ book.summary.author }}</v-card-subtitle>
              <v-card-text>{{ book.summary.publisher ?? '' }}</v-card-text>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
      <br />
    </div>
  </div>
</template>

<script>
import BookApi from '~/lib/OpenBDApi'

export default {
  async asyncData({ params }) {
    const books = await BookApi.getBookData(params.isbn).then((res) => {
      // OpenBDから取得できない本があるため古い駆ける
      const apiBooks = res.data.filter((book) => book != null)

      return BookApi.formatData(apiBooks)
    })
    return { books }
  },
}
</script>

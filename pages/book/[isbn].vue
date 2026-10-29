<template>
  <div>
    <div v-for="book in books" :key="book.summary.isbn">
      <v-card>
        <v-container>
          <v-row>
            <v-col cols="4">
              <img :src="book.summary.cover" style="width: 100%" >
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
      <br >
    </div>
  </div>
</template>

<script setup>
import BookApi from '~/lib/OpenBDApi'

definePageMeta({ key: (route) => route.fullPath })
const route = useRoute()
const response = await BookApi.getBookData(route.params.isbn)
const books = BookApi.formatData(response.data.filter((book) => book != null))
</script>

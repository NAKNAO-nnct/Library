<template>
  <v-card tile>
    <v-list class="v-list">
      <v-list-item-group>
        <v-list-item
          v-for="(item, i) in folders"
          :key="i"
          :to="`/folder/${item._id}`"
          class="tile"
        >
          <v-list-item-icon>
            <v-icon color="info">mdi-folder-open</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.name"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-for="(item, i) in books"
          :key="i"
          :href="`/book/${item.isbn}`"
        >
          <v-list-item-icon>
            <v-icon>mdi-book-open-page-variant-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-card>
</template>

<style scoped>
.tile {
  background-color: rgba(255, 255, 255, 0.1);
}

.v-list {
  padding: 0;
}
</style>

<script>
import BookManage from '~/lib/BookManager'

export default {
  async asyncData({ params }) {
    const folders = await BookManage.getFolderListForId(params.fid)
    const books = await BookManage.getBookListForId(params.fid)
    return { folders, books }
  },
}
</script>

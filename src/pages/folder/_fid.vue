<template>
  <v-card tile>
    <v-breadcrumbs :items="tree">
      <template v-slot:divider>
        <v-icon>mdi-chevron-right</v-icon>
      </template>
    </v-breadcrumbs>
    <v-list class="v-list">
      <v-list-item-group>
        <v-list-item
          v-for="(item, i) in folders"
          :key="'folder_' + i"
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
          :key="'book_' + i"
          :to="`/book/${item.isbn}`"
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
    // nameでソート
    let folders = await BookManage.getFolderListForId(params.fid)
    folders = folders.sort(function (a, b) {
      return a.name < b.name ? -1 : 1
    })
    // ISBNでソート
    let books = await BookManage.getBookListForId(params.fid)
    books = books.sort(function (a, b) {
      return a.ibsn < b.ibsn ? -1 : 1
    })
    const tree = BookManage.getTreeStructure(params.fid)
    return { folders, books, tree }
  },
}
</script>

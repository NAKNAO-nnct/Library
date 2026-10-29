<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item v-for="item in items" :key="item.to" :to="item.to" :prepend-icon="item.icon" :title="item.title" exact />
      </v-list>
    </v-navigation-drawer>
    <v-app-bar>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-app-bar-title>蔵書</v-app-bar-title>
      <v-spacer />
    </v-app-bar>
    <v-main>
      <v-container>
        <slot />
      </v-container>
    </v-main>
    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }} とろんぽっと.nara</span>
    </v-footer>
  </v-app>
</template>

<script setup>
import BookManage from '~/lib/BookManager'

const drawer = ref(false)
const items = [
  { icon: 'mdi-format-list-bulleted', title: '蔵書一覧', to: '/' },
  { icon: 'mdi-file-tree', title: 'Explore', to: '/folder/-1' },
  { icon: 'mdi-tune', title: '設定', to: '/setting' },
]
onMounted(() => BookManage.init())
</script>

<template>
  <v-app dark>
    <v-navigation-drawer v-model="drawer" :mini-variant="miniVariant" :clipped="clipped" app>
      <v-list>
        <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" router exact>
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }} とろんぽっと.nara</span>
    </v-footer>
  </v-app>
</template>

<script>
import BookManage from '~/lib/BookManager'
BookManage.init()

export default {
  data() {
    return {
      clipped: true,
      drawer: false,
      items: [
        {
          icon: 'mdi-format-list-bulleted',
          title: '蔵書一覧',
          to: '/',
        },
        {
          icon: 'mdi-file-tree',
          title: 'Explore',
          to: '/folder/-1',
        },
        {
          icon: 'mdi-tune',
          title: '設定',
          to: '/setting',
        },
      ],
      miniVariant: false,
      title: '蔵書',
    }
  },
}
</script>

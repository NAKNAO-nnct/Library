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
      <v-btn
        :icon="isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night'"
        :aria-label="themeLabel"
        :title="themeLabel"
        :aria-pressed="isDark"
        @click="toggleTheme"
      />
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
import { useTheme } from 'vuetify'
import { saveThemePreference } from '~/lib/ThemePreference'

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)
const themeLabel = computed(() => (isDark.value ? 'ライトテーマに切り替え' : 'ダークテーマに切り替え'))

async function toggleTheme() {
  const nextTheme = isDark.value ? 'light' : 'dark'
  await theme.change(nextTheme)
  saveThemePreference(nextTheme)
}

const drawer = ref(false)
const items = [
  { icon: 'mdi-format-list-bulleted', title: '蔵書一覧', to: '/' },
  { icon: 'mdi-file-tree', title: 'Explore', to: '/folder/-1' },
  { icon: 'mdi-tune', title: '設定', to: '/setting' },
]
</script>

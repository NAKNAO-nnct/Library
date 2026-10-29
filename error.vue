<template>
  <v-app>
    <v-main>
      <v-container>
        <h1>{{ title }}</h1>
        <a href="/">Home page</a>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
const props = defineProps({ error: { type: Object, default: null } })
const title = computed(() => (props.error?.statusCode === 404 ? '404 Not Found' : 'An error occurred'))
useHead({ title })
</script>

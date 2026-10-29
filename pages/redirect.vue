<template>
  <div />
</template>

<script setup>
const route = useRoute()
const base = useRuntimeConfig().app.baseURL
const param = route.query.p
if (param === undefined) {
  await navigateTo('/', { replace: true })
} else {
  await navigateTo('/' + param.replace(base, ''), { replace: true })
}
</script>

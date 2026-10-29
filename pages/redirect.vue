<template>
  <div />
</template>

<script setup>
import { legacyRedirectPath } from '~/lib/Routes'

const route = useRoute()
const base = useRuntimeConfig().app.baseURL
await navigateTo(legacyRedirectPath(route.query.p, base), { replace: true })
</script>

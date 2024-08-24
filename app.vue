<script lang="ts" setup>
import { appName } from '@/constants'

useHead({
  title: appName,
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
html.dark {
  background-color: #282c34;
  color: white;
}
</style>

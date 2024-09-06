<script lang="ts" setup>
import { appName } from '@/constants'

useHead({
  title: appName,
})
</script>

<template>
  <Body>
    <TilesCanvas />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </Body>
</template>

<style>
</style>

<script setup lang="ts">
const { data } = await useFetch('/api/pageview')

const timeAgo = useTimeAgo(() => data.value?.startAt || 0)
</script>

<template>
  <div class="text-gray-600 dark:text-gray-400">
    <span>{{ data?.pageview }}</span>
    page view since
    <span>{{ timeAgo }}</span>
  </div>
</template>

<style scope></style>

<script setup>
definePageMeta({ layout: false })
usePageSeo('/venue')
</script>

<template>
  <CommonTemporaryPage
    variant="coming-soon"
    title="Coming Soon..."
    subtitle="精彩內容即將上線，敬請期待！"
    @mobile-action="navigateTo('/#ticket')"
    @desktop-action="navigateTo('/')"
  />
</template>

<script setup>
definePageMeta({ layout: false })
usePageSeo('/venue')
</script>

<template>
  <CommonTemporaryPage
    variant="coming-soon"
    title="Coming Soon..."
    subtitle="精彩內容即將上線，敬請期待！"
    @mobile-action="navigateTo('https://5xcamp.us/webconf2026-ticket', { external: true, open: { target: '_blank' } })"
    @desktop-action="navigateTo('/')"
  />
</template>

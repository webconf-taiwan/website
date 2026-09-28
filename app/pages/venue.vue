<script setup>
definePageMeta({ layout: false })
useSeoMeta({ title: '場域介紹 - 網站建置中', robots: 'noindex, nofollow' })
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

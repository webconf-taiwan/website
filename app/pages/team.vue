<script setup>
definePageMeta({ layout: false })

useSeoMeta({
  title: '主辦團隊 - 網站建置中',
  robots: 'noindex, nofollow'
})

function handleTicket () {
  return navigateTo('/#ticket')
}

function handleHome () {
  return navigateTo('/')
}
</script>

<template>
  <CommonTemporaryPage
    variant="coming-soon"
    title="Coming Soon..."
    subtitle="精彩內容即將上線，敬請期待！"
    @mobile-action="handleTicket"
    @desktop-action="handleHome"
  />
</template>

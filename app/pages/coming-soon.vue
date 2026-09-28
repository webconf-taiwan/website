<script setup>
definePageMeta({ layout: false })

usePageSeo('/coming-soon')

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

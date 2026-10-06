<script setup>
definePageMeta({ layout: false })

usePageSeo('/staff')

function handleTicket () {
  return navigateTo('https://5xcamp.us/webconf2026-ticket', { external: true, open: { target: '_blank' } })
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

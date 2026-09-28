<script setup>
definePageMeta({ layout: false })

usePageSeo('/404-demo')

function handleTicket () {
  return navigateTo('/#ticket')
}

function handleHome () {
  return navigateTo('/')
}
</script>

<template>
  <CommonTemporaryPage
    variant="404"
    title="404"
    subtitle="找不到此頁面"
    @mobile-action="handleTicket"
    @desktop-action="handleHome"
  />
</template>

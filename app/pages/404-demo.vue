<script setup>
definePageMeta({ layout: false })

useSeoMeta({
  title: '404 Demo',
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
    variant="404"
    title="404"
    subtitle="找不到此頁面"
    @mobile-action="handleTicket"
    @desktop-action="handleHome"
  />
</template>

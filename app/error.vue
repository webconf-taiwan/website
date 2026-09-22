<script setup>
const props = defineProps({
  error: {
    type: Object,
    default: null
  }
})

const statusCode = computed(() => props.error?.statusCode || 404)
const title = computed(() => String(statusCode.value || 404))
const subtitle = computed(() => {
  if (statusCode.value === 404) return '找不到此頁面'

  return '發生了一些問題'
})

function handleTicket () {
  clearError({ redirect: '/#ticket' })
}

function handleHome () {
  clearError({ redirect: '/' })
}
</script>

<template>
  <CommonTemporaryPage
    variant="404"
    :title="title"
    :subtitle="subtitle"
    @mobile-action="handleTicket"
    @desktop-action="handleHome"
  />
</template>

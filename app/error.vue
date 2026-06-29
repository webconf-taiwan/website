<script setup>
defineProps({
  error: {
    type: Object,
    default: null
  }
})

function handleHome () {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-screen">
    <Error :error="error" />

    <div class="fixed inset-x-0 bottom-10 flex justify-center">
      <AtomButton intent="primary" @click="handleHome">
        返回首頁
      </AtomButton>
    </div>
  </div>
</template>

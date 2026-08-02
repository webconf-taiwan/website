<script setup>
const props = defineProps({
  error: {
    type: Object,
    default: null
  }
})

const statusCode = computed(() => props.error?.statusCode || 404)
const message = computed(() => {
  if (statusCode.value === 404) return '找不到這個頁面'

  return props.error?.message || '發生了一些問題'
})
</script>

<template>
  <section class="flex min-h-screen items-center justify-center py-20">
    <div class="container text-center">
      <p class="text-h1 leading-none text-brand md:!text-[10rem] lg:!text-[14rem]">
        {{ statusCode }}
      </p>

      <h1 class="text-h3 mt-6 text-txt-dark">
        {{ message }}
      </h1>

      <p class="text-body mx-auto mt-3 max-w-xl text-txt-light">
        抱歉，你尋找的內容可能已被移動，或目前無法顯示。
      </p>
    </div>
  </section>
</template>

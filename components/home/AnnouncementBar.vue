<script setup lang="ts">
// 只在 webconf.tw / www.webconf.tw 顯示；2025.webconf.tw（歷史站）與其他網域不顯示
// 頁面為預渲染，建置時取不到網址，因此在瀏覽器端判斷
const SHOW_HOSTS = ['webconf.tw', 'www.webconf.tw']
const visible = ref(false)

onMounted(() => {
  visible.value = SHOW_HOSTS.includes(window.location.hostname)
})
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-x-0 bottom-0 z-[100] flex w-[100dvw] bg-[rgba(0,0,0,0.85)]"
  >
    <div
      class="mx-auto my-3 flex flex-col items-center justify-center font-bold leading-[1.6] md:flex-row md:text-body-18"
    >
      <div
        class="ml-[-18px] w-full text-center text-webconf-gray md:ml-0 md:w-auto md:text-start"
      >
        【新頁面即將釋出】
      </div>

      <div class="text-center text-white">
        WebConf 2026 即將到來，敬請期待！
      </div>
    </div>
  </div>
</template>

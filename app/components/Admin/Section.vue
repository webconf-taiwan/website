<!--
  後台設定頁的區塊卡片：標題 + 說明 + 內容。
  原本用 <details> 讓每個區塊自己收合，改成 tab 切換（見 home-settings.vue）之後
  同時間只會顯示一個區塊，收合已經沒必要，簡化成單純卡片。
-->
<script setup>
defineProps({
  title: { type: String, required: true },
  code: { type: String, default: '' },
  description: { type: String, default: '' }
})
</script>

<template>
  <div class="border border-gray-300 bg-white pb-6">
    <div class="text-body-sm px-6 py-4 text-txt-dark">
      <span v-if="code" class="text-caption mr-2 font-mono text-txt-light">{{ code }}</span>
      <span class="font-medium">{{ title }}</span>
    </div>
    <p v-if="description" class="text-caption -mt-2 px-6 pb-4 text-txt-light">
      {{ description }}
    </p>
    <div class="flex flex-col gap-5 px-6">
      <slot />
    </div>
  </div>
</template>

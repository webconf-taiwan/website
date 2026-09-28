<script setup>
import 'virtual:svg-icons-register'
</script>

<template>
  <div class="selection:bg-brand selection:text-white">
    <NuxtLoadingIndicator color="#110AFF" />
    <!-- 首次進站 loading：整站只 mount 一次，站內換頁不會再出現（見 Intro.vue） -->
    <LayoutPageIntro />
    <LayoutPageTransition />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

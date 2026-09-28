<script setup>
import 'virtual:svg-icons-register'
</script>

<template>
  <div class="selection:bg-brand selection:text-white">
    <NuxtLoadingIndicator color="#110AFF" />
    <LayoutPageTransition />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

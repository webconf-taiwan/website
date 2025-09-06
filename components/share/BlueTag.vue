<script setup lang="ts">
interface Props {
  text: string
}

const _ = defineProps<Props>()
</script>

<template>
  <span class="bg-webconf-blue px-8 py-2 text-btn-14 text-white">
    {{ text }}
  </span>
</template>

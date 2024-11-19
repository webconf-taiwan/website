<script setup lang="ts">
import type { Sponsor } from '~/types/sponsors'

defineProps<{
  introduction: Sponsor['introduction']
}>()
</script>

<template>
  <div>
    <p>
      {{ introduction }}
    </p>
  </div>
</template>

<style scoped></style>

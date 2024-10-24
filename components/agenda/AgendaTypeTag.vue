<script lang="ts" setup>
const { tags } = defineProps<{
  tags: string[]
}>()
</script>

<template>
  <div class="flex flex-wrap gap-2 overflow-y-clip">
    <div
      v-for="tag in tags"
      :key="tag"
      class="rounded border border-primary-green/30 px-2 py-1 text-center font-['Mina'] text-sm text-primary-green"
    >
      #{{ tag }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  date: string
  startTime: string
  endTime: string
  location: string
  remark?: string
}>()

const formatted = useDateFormat(props.date, 'MM/DD (ddd.)', { locales: 'en' })
</script>

<template>
  <div class="mb-4 flex flex-col items-start gap-y-2 tracking-wider text-primary-green lg:flex-row lg:items-center lg:gap-x-10">
    <div class="flex flex-wrap items-center gap-x-1">
      <Icon
        name="i-heroicons-clock"
        size="16"
      />
      <span>{{ formatted }}</span>
      <span>{{ startTime }}~{{ endTime }}</span>
    </div>

    <div class="flex flex-wrap items-center gap-x-1">
      <Icon
        name="i-heroicons-map-pin"
        size="16"
      />
      <span>{{ location }}棟</span>
      <span v-if="remark">( {{ remark }} )</span>
    </div>
  </div>
</template>

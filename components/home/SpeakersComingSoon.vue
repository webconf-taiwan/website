<script setup lang="ts">
import type { Speaker } from '~/types/speakers'

const props = defineProps<{
  speakers: Speaker[]
  speakersRows: number
  speakersColumns: number
}>()

const speakersColumnsClasses = [
  'left-0',
  'left-1/2 sm:left-1/3',
  'sm:left-2/3 hidden sm:flex',
]

function isSpeakersColumnEmpty(colIndex: number) {
  const start = colIndex * props.speakersRows
  const end = start + props.speakersRows
  return props.speakers.slice(start, end).length === 0
}
</script>

<template>
  <div
    v-for="(_, colIndex) in speakersColumns"
    v-show="isSpeakersColumnEmpty(colIndex)"
    :key="`coming-soon-${colIndex}`"
    class="pointer-events-none absolute inset-y-0 flex w-1/2 items-center justify-center text-xl font-bold tracking-wider text-white/10 sm:w-1/3"
    :class="speakersColumnsClasses[colIndex]"
  >
    coming soon
  </div>
</template>

<style scoped></style>

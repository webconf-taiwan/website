<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

interface SkeletonProps {
  class?: HTMLAttributes['class']
  isShowLoading?: boolean
}

const props = defineProps<SkeletonProps>()
</script>

<template>
  <div :class="cn('animate-pulse rounded-md bg-primary/10 flex place-content-center', props.class)">
    <div
      v-if="isShowLoading"
      class="m-auto"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
      ><path
        fill="none"
        stroke="currentColor"
        stroke-dasharray="15"
        stroke-dashoffset="15"
        stroke-linecap="round"
        stroke-width="2"
        d="M12 3C16.9706 3 21 7.02944 21 12"
      ><animate
        fill="freeze"
        attributeName="stroke-dashoffset"
        dur="0.3s"
        values="15;0"
      /><animateTransform
        attributeName="transform"
        dur="1.5s"
        repeatCount="indefinite"
        type="rotate"
        values="0 12 12;360 12 12"
      /></path></svg>
    </div>
  </div>
</template>

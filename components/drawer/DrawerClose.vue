<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { cn } from '~/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  breakpoint: MaybeRefOrGetter<'sm' | 'md' | 'lg' | 'xl' | '2xl'>
}>()

const emit = defineEmits<{
  close: []
}>()

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerLg = breakpoints.smaller('lg')

const buttonClass = computed(() => {
  return isSmallerLg.value
    ? `trapezoid-top-right right-0 top-1 h-12 sm:h-14 w-[84px] -translate-y-full`
    : `trapezoid-left-center left-1 top-1/2 h-60 w-14 -translate-x-full -translate-y-1/2`
})
</script>

<template>
  <button
    type="button"
    class="absolute block bg-black pl-6 lg:pl-0"
    :class="cn(buttonClass, props.class)"
    @click="emit('close')"
  >
    <Icon
      size="40"
      class="text-primary-green"
      name="i-heroicons-x-mark"
    />
  </button>
</template>

<style scoped>
.trapezoid-left-center {
  clip-path: polygon(0% 32px, 100% 0%, 100% 100%, 0% calc(100% - 32px));
}

.trapezoid-top-right {
  clip-path: polygon(32px 0%, 100% 0%, 100% 100%, 0% 100%);
}
</style>

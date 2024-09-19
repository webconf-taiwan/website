<script setup lang="ts">
import type { WithClassAsProps } from './interface'
import { cn } from '~/lib/utils'
import { useCarousel } from './useCarousel'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<WithClassAsProps>()

const { carouselRef, orientation } = useCarousel()
</script>

<template>
  <div
    ref="carouselRef"
    class="overflow-hidden focus-visible:outline-none"
  >
    <div
      :class="
        cn(
          'flex',
          orientation === 'horizontal' ? '' : 'flex-col',
          props.class,
        )"
      v-bind="$attrs"
    >
      <slot></slot>
    </div>
  </div>
</template>

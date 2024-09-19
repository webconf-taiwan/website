<script setup lang="ts">
import type { WithClassAsProps } from './interface'
import { cn } from '~/lib/utils'

const props = defineProps<WithClassAsProps>()

// const { orientation } = useCarousel()
</script>

<template>
  <div
    role="group"
    aria-roledescription="slide"
    :class="cn(
      'min-w-0 shrink-0 grow-0 basis-full',
      props.class,
    )"
  >
    <slot></slot>
  </div>
</template>

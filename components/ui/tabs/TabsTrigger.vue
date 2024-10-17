<script setup lang="ts">
import { TabsTrigger, type TabsTriggerProps, useForwardProps } from 'radix-vue'
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<TabsTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <TabsTrigger
    v-bind="forwardedProps"
    :class="cn(
      'relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none before:transition-all before:absolute before:inset-0 disabled:opacity-50 data-[state=active]:before:bg-primary-green before:bg-primary-deep-green data-[state=active]:text-black data-[state=active]:before:scale-y-[1.15] pb-2 pt-3 lg:pb-2 lg:pt-4 lg:data-[state=active]:pb-3.5 data-[state=active]:pb-3 lg:h-[52px] h-[46px]',
      props.class,
    )"
  >
    <slot></slot>
  </TabsTrigger>
</template>

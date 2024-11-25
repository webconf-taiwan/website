<script setup lang="ts">
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { Sponsor } from '~/types/sponsors'

defineProps<{
  introduction: Sponsor['introduction']
  introTitle: string
}>()

const isOpen = ref(false)
</script>

<template>
  <div class="content-center border border-primary-green px-5 py-2">
    <Collapsible v-model:open="isOpen">
      <CollapsibleTrigger as-child>
        <button
          type="button"
          class="flex w-full items-center justify-between text-xl md:hidden"
        >
          <span>{{ introTitle }}簡介</span>
          <Icon
            name="i-heroicons:chevron-down"
            size="20"
            class="transition-transform"
            :class="[isOpen ? '-rotate-180' : '']"
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent class="mt-3 pb-2">
        <p class="whitespace-pre-line leading-[1.6rem] tracking-wider">
          {{ introduction }}
        </p>
      </CollapsibleContent>
    </Collapsible>
  </div>
</template>

<style scoped></style>

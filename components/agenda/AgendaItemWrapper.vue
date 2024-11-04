<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import type { AgendaItem, AgendaLocation } from '~/types/agendas'

const props = defineProps<{
  agenda: AgendaItem
  location: AgendaLocation
  isBroadcast: boolean
}>()

const agendasStore = useAgendasStore()
const tagsStore = useTagsStore()

const isAgendaDisabled = computed(() => {
  if (tagsStore.IsSelectedTagsEmpty)
    return false
  return !tagsStore.selectedTags.some(tag => props.agenda.tags.includes(tag))
})

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerLg = breakpoints.smaller('lg')

const drawerSlideDirection = computed(() => {
  return isSmallerLg.value ? 'slide-up-full' : 'slide-left'
})

const agendaDrawer = useTemplateRef('agendaDrawer')

function triggerAgenda(agenda: AgendaItem) {
  agendasStore.currentAgendaDrawerId = agenda.id
  agendasStore.setAgendaDrawerRenderData(agenda)
  agendaDrawer.value?.open()
}
</script>

<template>
  <button
    v-if="isBroadcast"
    type="button"
    class="group relative block overflow-hidden bg-black transition-colors focus-visible:outline-none lg:max-w-[334px]"
    @click="triggerAgenda(agenda)"
  >
    <div
      v-show="!isAgendaDisabled"
      class="absolute inset-0 z-0 scale-75 rounded-xl bg-primary-deep-green opacity-0 blur-sm transition ease-in lg:group-hover:scale-105 lg:group-hover:opacity-100"
    ></div>

    <template v-if="agenda.title === '同步聯播'">
      <div class="relative flex h-full content-center items-center justify-between px-3 py-4 max-lg:border-t max-lg:border-t-primary-green/30 lg:justify-center">
        <p
          class="text-left text-base font-normal transition-colors lg:text-center lg:text-lg lg:font-medium"
          :class="[isAgendaDisabled ? 'text-primary-green/30' : 'text-primary-green']"
        >
          {{ agenda.title }}
        </p>
        <div class="flex shrink-0 items-center gap-x-1 text-[hsla(182,25%,74%,1)] lg:hidden">
          <Icon
            name="i-heroicons-map-pin"
            size="16"
          />
          <span>{{ location }} 棟</span>
        </div>
      </div>
    </template>
    <template v-else>
      <AgendaItem
        :agenda="agenda"
        :location="location"
        :is-agenda-disabled="isAgendaDisabled"
      />
    </template>
  </button>

  <button
    v-else
    type="button"
    class="group relative block overflow-hidden border bg-black transition-colors focus-visible:outline-none lg:max-w-[334px]"
    :class="[isAgendaDisabled ? 'border-primary-green/30' : 'border-primary-green']"
    @click="triggerAgenda(agenda)"
  >
    <div
      v-show="!isAgendaDisabled"
      class="absolute inset-0 z-0 scale-75 rounded-xl bg-primary-deep-green opacity-0 blur-sm transition ease-in lg:group-hover:scale-105 lg:group-hover:opacity-100"
    ></div>

    <AgendaItem
      :agenda="agenda"
      :location="location"
      :is-agenda-disabled="isAgendaDisabled"
    />
  </button>

  <Teleport to="body">
    <Drawer
      ref="agendaDrawer"
      :slide-direction="drawerSlideDirection"
      drawer-class="lg:w-[60dvw]"
      @close="agendasStore.resetContentTab"
    >
      <DrawerContentLayout>
        <template #content>
          <AgendaDrawerWrapper />
        </template>
      </DrawerContentLayout>
    </Drawer>
  </Teleport>
</template>

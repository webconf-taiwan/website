<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import type { AgendaItem, AgendaLocation } from '~/types/agendas'

const props = defineProps<{
  agenda: AgendaItem
  location: AgendaLocation
  isBroadcast: boolean
}>()

const agendasStore = useAgendasStore()
const { selectedTags, isShowAllAgendas } = storeToRefs(agendasStore)

const isAgendaVisible = computed(() => {
  if (isShowAllAgendas.value)
    return true
  return selectedTags.value.some(tag => props.agenda.tags.includes(tag))
})
const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerLg = breakpoints.smaller('lg')

const drawerSlideDirection = computed(() => {
  return isSmallerLg.value ? 'slide-up-full' : 'slide-left'
})

const agendaDrawer = useTemplateRef('agendaDrawer')

const socialLinks = [
  {
    icon: 'iconoir:facebook',
    href: 'https://www.facebook.com/webconf.tw',
  },
  {
    icon: 'ri:twitter-x-fill',
    href: 'https://x.com/webconf_tw',
  },
  {
    icon: 'heroicons:globe-alt',
    href: 'https://www.youtube.com/@webconf.tw',
  },
  {
    icon: 'mdi:instagram',
    href: 'https://www.instagram.com/webconf.tw/',
  },
]
</script>

<template>
  <button
    v-if="isBroadcast"
    v-show="isAgendaVisible"
    type="button"
    class="group relative block overflow-hidden bg-black transition-colors lg:max-w-[334px]"
  >
    <div class="absolute inset-0 z-0 scale-75 rounded-xl bg-primary-deep-green opacity-0 blur-sm transition ease-in lg:group-hover:scale-105 lg:group-hover:opacity-100"></div>

    <template v-if="agenda.title === '同步聯播'">
      <div class="relative h-full content-center">
        <p class="text-center text-lg font-medium text-primary-green">
          {{ agenda.title }}
        </p>
      </div>
    </template>
    <template v-else>
      <AgendaItem :agenda="agenda" />
    </template>
  </button>

  <button
    v-else
    v-show="isAgendaVisible"
    type="button"
    class="group relative block max-w-[334px] overflow-hidden border border-primary-green bg-black"
    @click="agendaDrawer?.open()"
  >
    <div class="absolute inset-0 z-0 scale-75 rounded-xl bg-primary-deep-green opacity-0 blur-sm transition ease-in lg:group-hover:scale-105 lg:group-hover:opacity-100"></div>
    <AgendaItem :agenda="agenda" />
  </button>

  <Teleport to="body">
    <Drawer
      ref="agendaDrawer"
      :slide-direction="drawerSlideDirection"
      drawer-class="lg:w-[75dvw] xl:w-[55dvw]"
    >
      <DrawerContentLayout>
        <template #content>
          <AgendaDrawerContent :social-links="socialLinks" />
        </template>
      </DrawerContentLayout>
    </Drawer>
  </Teleport>
</template>

<style scoped></style>

<script setup lang="ts">
import type { AgendaOtherLink } from '~/types/agendas'

defineProps<{
  agendaOtherLinks: AgendaOtherLink[]
}>()

function getAgendaOtherLinks(links: AgendaOtherLink[]) {
  return links.map((link) => {
    const linkData = findAgendaOtherLinkByType(link.type)

    return {
      ...linkData,
      href: link.href,
    }
  })
}
</script>

<template>
  <div
    class="grid w-full grid-cols-2 gap-x-2 lg:flex lg:max-w-[380px]"
  >
    <NuxtLink
      v-for="link in getAgendaOtherLinks(agendaOtherLinks)"
      :key="link.href"
      external
      :to="link.href"
      target="_blank"
      aria-label="其他連結"
      class="flex shrink-0 items-center justify-center gap-x-2 border border-primary-green px-6 py-2 text-center text-xl duration-150 lg:hover:bg-primary-dark-green"
    >
      <span>{{ link.text }}</span>
      <Icon
        v-if="link.icon"
        :name="link.icon"
        size="24"
        class="hidden xl:block"
      />
    </NuxtLink>
  </div>
</template>

<style scoped></style>

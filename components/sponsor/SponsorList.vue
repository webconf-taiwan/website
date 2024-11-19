<script setup lang="ts">
import type { Sponsor } from '~/types/sponsors'

defineProps<{
  sponsorList: Sponsor[]
  typeName: string
}>()
</script>

<template>
  <div>
    <SponsorTitle>
      <template #title>
        {{ typeName }}
      </template>
    </SponsorTitle>

    <div
      v-for="sponsor in sponsorList"
      :key="sponsor.name"
      class="mt-12 flex flex-col items-center justify-between gap-x-10 gap-y-5 md:flex-row md:items-start"
    >
      <SponsorItem :sponsor-data="sponsor" />
    </div>
  </div>
</template>

<style scoped></style>

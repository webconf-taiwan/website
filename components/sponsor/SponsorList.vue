<script setup lang="ts">
import type { Sponsor } from '~/types/sponsors'

defineProps<{
  sponsorList: Sponsor[]
  typeName: string
  introTitle: string
}>()
</script>

<template>
  <div class="mx-auto max-md:max-w-72">
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
      <SponsorItem
        :sponsor-data="sponsor"
        :intro-title="introTitle"
      />
    </div>
  </div>
</template>

<style scoped></style>

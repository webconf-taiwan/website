<script setup lang="ts">
import { sponsorsData } from '~/constants/sponsors'
</script>

<template>
  <section class="mx-auto -mt-20 w-full max-w-[1096px] pb-28">
    <SponsorList
      :sponsor-list="sponsorsData.organizers"
      type-name="主辦單位"
      intro-title="主辦單位"
    />
  </section>
</template>

<style scoped></style>

<script lang="ts" setup>
useSeoMeta({
  title: '贊助廠商',
  description:
    '有各界企業單位、品牌夥伴的大力支持，WebConf Taiwan 2025 才能順利舉辦。',
})
</script>

<template>
  <section class="flex-1">
    <ShareBanner
      title="SPONSORS"
      sub-title="贊助廠商"
    />
    <SponsorsPanel />
    <SponsorsOrganizersSection />
    <SponsorsPartnersSection />
    <SponsorsSponsorshipSection />
  </section>
</template>

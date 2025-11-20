<script lang="ts" setup>
useSeoMeta({
  title: '贊助廠商',
  description:
    'WebConf Taiwan 是一個聚集網頁技術愛好者與專家的年度盛會。今年，我們將以 「Connecting the Web to a Sustainable Future」 為主題，探索網頁技術如何推動永續發展，並帶來創新解方，從技術演進到社會責任，共同思考網路世界的未來。誠摯邀請您成為 WebConf Taiwan 的贊助夥伴，一同連結技術與未來，攜手打造更永續的網路生態！',
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

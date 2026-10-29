<script setup lang="ts">
import {
  eventBasic,
  eventLocation,
  eventOffers,
  eventOrganizer,
  eventPerformers,
} from '~/config/seo.config'

useSchemaOrg([
  eventOrganizer,
  eventLocation,
  ...eventPerformers,
  {
    ...eventBasic,
    location: { '@id': 'https://2025.webconf.tw/#location' },
    organizer: { '@id': 'https://2025.webconf.tw/#organization' },
    offers: eventOffers,
  },
])
</script>

<template>
  <div>
    <HomeHero />
    <HomeAbout />
    <HomeFeaturedSpeakers />
    <HomeVenue />
    <HomeOrganizersMarquee />
    <HomeCTA />
    <HomeCocNotice />
    <HomeAnnouncementBar />
  </div>
</template>

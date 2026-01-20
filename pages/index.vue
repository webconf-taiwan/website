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
    location: { '@id': 'https://webconf.tw/#location' },
    organizer: { '@id': 'https://webconf.tw/#organization' },
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

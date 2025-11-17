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
    performer: eventPerformers.map(p => ({ '@id': p['@id'] })),
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
  </div>
</template>

<script setup lang="ts">
import {
  eventBasic,
  eventLocation,
  eventOffers,
  eventOrganizer,
  eventPerformers,
} from '~/config/seo.config'

useSchemaOrg([
  {
    ...eventBasic,
    location: eventLocation,
    organizer: eventOrganizer,
    offers: eventOffers,
    performer: eventPerformers,
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

<script setup lang="ts">
import {
  eventBasic,
  eventLocation,
  eventOffers,
  eventOrganizer,
} from '~/config/seo.config'

useSchemaOrg([
  {
    ...eventBasic,
    location: eventLocation,
    organizer: eventOrganizer,
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
  </div>
</template>

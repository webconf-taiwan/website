<script setup lang="ts">
const route = useRoute('agenda-v2-speakerId')
const router = useRouter()

useSeoMeta({
  robots: 'noindex, nofollow',
})

const { data: allSpeakers } = await useAsyncData('all-speakers', () =>
  queryCollection('content').all())

const currentSpeaker = computed(() => {
  const speakerIds = route.params.speakerId

  if (!speakerIds || !allSpeakers.value)
    return null

  const findSpeakerInfos = allSpeakers.value.filter(speaker =>
    speakerIds?.includes(speaker.meta.speakerId as string),
  )

  return findSpeakerInfos
})

function handleClose() {
  router.push('/agenda/v2')
}
</script>

<template>
  <AgendaSpeakersDetailsDialog
    v-if="currentSpeaker && currentSpeaker.length > 0"
    :speaker="currentSpeaker"
    :is-animation="true"
    @close="handleClose"
  />
</template>

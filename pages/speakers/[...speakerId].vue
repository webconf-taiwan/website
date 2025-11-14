<script setup lang="ts">
const route = useRoute('speakers-speakerId')
const router = useRouter()
const { setToggleModal } = useGlobalState()

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
  router.push('/speakers')
}

watch(
  () => currentSpeaker.value,
  (speaker) => {
    if (speaker && speaker.length > 0) {
      setToggleModal(true)
    }
  },
  { immediate: true },
)
</script>

<template>
  <AgendaSpeakersDetailsDialog
    v-if="currentSpeaker && currentSpeaker.length > 0"
    :speaker-ids="route.params.speakerId"
    :speaker="currentSpeaker"
    type="speakers"
    :is-animation="true"
    @close="handleClose"
  />
</template>

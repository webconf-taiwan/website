<script setup lang="ts">
const route = useRoute('speakers-v2-index-speakerId')
const router = useRouter()
const { setToggleModal } = useGlobalState()

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
  router.push('/speakers/v2')
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
    :speaker="currentSpeaker"
    type="speakers"
    :is-animation="true"
    @close="handleClose"
  />
</template>

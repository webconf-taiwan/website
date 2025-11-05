<script setup lang="ts">
const route = useRoute('agenda-speakerId')
const router = useRouter()

const speakerId = computed(() => {
  const param = route.params.speakerId
  return Array.isArray(param) ? param[0] : param
})

const { data: allSpeakers } = await useAsyncData('all-speakers', () =>
  queryCollection('content').all())

const currentSpeaker = computed(() => {
  if (!speakerId.value || !allSpeakers.value)
    return null

  const speaker = allSpeakers.value.find(
    speaker => speaker.meta.speakerId === speakerId.value,
  )

  return speaker ? [speaker] : null
})

function handleClose() {
  router.push('/agenda')
}
</script>

<template>
  <AgendaSpeakersPopver
    v-if="currentSpeaker && currentSpeaker.length > 0"
    :speaker="currentSpeaker"
    @close="handleClose"
  />
</template>

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

  return allSpeakers.value.find(
    speaker => speaker.meta.speakerId === speakerId.value,
  )
})

function handleClose() {
  router.push('/agenda')
}
</script>

<template>
  <AgentdaSpeakersPopver
    v-if="currentSpeaker"
    :speaker="currentSpeaker"
    @close="handleClose"
  />
</template>

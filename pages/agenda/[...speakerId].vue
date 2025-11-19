<script setup lang="ts">
const route = useRoute('agenda-speakerId')
const router = useRouter()

// 允許的多人議程組合 (白名單)
const ALLOWED_MULTI_SPEAKER_GROUPS = [
  ['3', '4'], // 第一場
  ['33', '34'], // 第二場
  ['00', '23', '24'], // 第三場
]

const { data: allSpeakers } = await useAsyncData('all-speakers', () =>
  queryCollection('content').all())

const currentSpeaker = computed(() => {
  const speakerIds = route.params.speakerId

  if (!speakerIds || !allSpeakers.value)
    return null

  let isAllowedGroup = true
  if (speakerIds.length > 1) {
    // 檢查是否在允許的多人議程組合中
    isAllowedGroup = ALLOWED_MULTI_SPEAKER_GROUPS.some((group) => {
      if (group.length !== speakerIds.length)
        return false

      return (
        group.every(id => speakerIds.includes(id))
        && speakerIds.every(id => group.includes(id))
      )
    })
  }

  if (!isAllowedGroup)
    return null

  const findSpeakerInfos = allSpeakers.value.filter(speaker =>
    speakerIds?.includes(speaker.meta.speakerId as string),
  )

  return findSpeakerInfos
})

function handleClose() {
  router.push('/agenda')
}
</script>

<template>
  <AgendaSpeakersDetailsDialog
    v-if="currentSpeaker && currentSpeaker.length > 0"
    :speaker="currentSpeaker ?? []"
    :speaker-ids="route.params.speakerId"
    :is-animation="true"
    @close="handleClose"
  />
</template>

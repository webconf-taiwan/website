<template>
  <div class="flex-col md:flex-row flex min-h-[186px] gap-2">
    <TimelineCell :startTime="startTime" :endTime="endTime" />
    <div class="w-full md:basis-[90%] flex flex-col md:flex-row gap-2">
      <template v-for="(speaker, index) in speakerInfoArr" :key="index">
        <div
          v-if="speaker !== null"
          class="w-full md:basis-1/3 border border-custom-teal-500 p-3 md:px-5 md:py-4"
          :class="{
            'md:block': speaker === null,
            'cursor-pointer': speaker !== null,
          }"
          :data-speakerId="speaker.id"
          @click="() => handleOpenSpeakerModal(speaker.id)"
        >
          <SpeakerCell
            :speechTopic="speaker.speechTopic"
            :speakerName="speaker.speakerName"
            :altName="speaker.altName"
            :categoryTags="speaker.categoryTags"
            :room="speaker.room"
          />
        </div>
        <div
          v-else
          class="w-full md:basis-1/3 border border-custom-teal-500 p-3 md:px-5 md:py-4"
          :class="{
            'md:block': speaker === null,
          }"
        ></div>
      </template>
    </div>
  </div>
</template>

<script setup>
import TimelineCell from "@/components/agenda/TimelineCell.vue";
import SpeakerCell from "@/components/agenda/SpeakerCell.vue";

const props = defineProps({
  speakerInfoArr: {
    type: Array,
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  onOpenSpeakerModal: {
    type: Function,
  },
});

// function padEnd(array, minLength, fillValue = null) {
//   return Object.assign(new Array(minLength).fill(fillValue), array);
// }

const handleOpenSpeakerModal = (speakerId) => {
  if (speakerId) {
    props.onOpenSpeakerModal(speakerId);
  }
};

// const handleOpenSpeakerModal = (speakerId) => () => {
//   if (speakerId) {
//     props.onOpenSpeakerModal(speakerId);
//   }
// };

// const paddedSpeakerInfoArr = computed(() => padEnd(props.speakerInfoArr, 3, null));
</script>

<style scoped></style>

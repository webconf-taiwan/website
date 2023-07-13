<template>
  <div class="flex-col md:flex-row flex min-h-[186px] gap-2">
    <TimelineCell :startTime="startTime" :endTime="endTime" />
    <div class="w-full md:basis-[90%] flex flex-col md:flex-row gap-2">
      <template v-for="(speaker, index) in speakerInfoArr" :key="index">
        <div
          v-if="speaker !== null"
          class="w-full md:basis-1/3 border border-custom-teal-500 p-3 md:px-5 md:py-4 speaker-cell"
          :class="{
            'md:block': speaker === null,
            'cursor-pointer': speaker !== null,
          }"
          :data-speakerId="speaker.id"
          @click="() => handleOpenSpeakerModal(speaker.id)"
        >
          <SpeakerCell
            v-if="speaker.id !== 'dual'"
            :speechTopic="speaker.speechTopic"
            :id="speaker.id"
            :speakerName="speaker.speakerName"
            :altName="speaker.altName"
            :categoryTags="speaker.categoryTags"
            :room="speaker.room"
          />

          <DualSpeakerCell
            v-if="speaker.id === 'dual'"
            :dualSpeakerInfoArr="speaker.data"
            :speechTopic="speaker.speechTopic"
            :categoryTags="speaker.categoryTags"
            :room="speaker.room"
          />
        </div>
        <div
          v-if="speaker === null"
          class="hidden md:basis-1/3 border border-custom-teal-500 p-3 md:px-5 md:py-4"
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
// import { ref, watchEffect} from "vue";
// import { computed } from "vue";

import DualSpeakerCell from "@/components/agenda/DualSpeakerCell.vue";

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

const handleOpenSpeakerModal = (speakerId) => {
  if (speakerId) {
    props.onOpenSpeakerModal(speakerId);
  }
};
</script>

<style scoped>
.speaker-cell {
  transition: background-color 0.3s;
}

.speaker-cell:hover {
  background-color: #006a97;
}
</style>

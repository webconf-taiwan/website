<template>
  <div class="flex-col md:flex-row flex min-h-[186px] gap-2">
    <TimelineCell :startTime="startTime" :endTime="endTime" />
    <div class="w-full md:basis-[90%] flex flex-col md:flex-row gap-2">
      <template v-for="(speaker, index) in paddedSpeakerInfoArr" :key="index">
        <div
          class="w-full md:basis-1/3 border border-custom-teal-500 p-3 md:px-5 md:py-4"
          :class="{ hidden: speaker === null, 'md:block': speaker === null }"
        >
          <SpeakerCell
            v-if="speaker !== null"
            :speechTopic="speaker.speechTopic"
            :speakerName="speaker.speakerName"
            :altName="speaker.altName"
            :categoryTags="speaker.categoryTags"
            :room="speaker.room"
          />
        </div>
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
});

function padEnd(array, minLength, fillValue = null) {
  return Object.assign(new Array(minLength).fill(fillValue), array);
}

const paddedSpeakerInfoArr = padEnd(props.speakerInfoArr, 3, null);
</script>

<style scoped></style>

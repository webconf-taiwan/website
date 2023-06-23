<template>
  <div class="flex flex-col md:flex-row min-h-[186px] gap-2">
    <TimelineCell :startTime="startTime" :endTime="endTime" />

    <div
      class="p-3 md:p-0 basis-full md:basis-[90%] flex flex-col md:flex-row border border-custom-teal-500 items-center"
    >
      <div class="mb-3 md:mb-0 w-full h-full md:basis-1/3 md:px-5 md:py-4">
        <SpeakerCell
          :speechTopic="speakerInfo.speechTopic"
          :speakerName="speakerInfo.speakerName"
          :altName="speakerInfo.altName"
          :categoryTags="speakerInfo.categoryTags"
          :room="speakerInfo.room"
        ></SpeakerCell>
      </div>
      <div
        class="fh-[33.33%] md:h-[90%] py-5 text-lg w-full md:basis-1/3 border-t md:border-l md:border-t-0 border-custom-teal-700 flex items-center justify-between md:justify-center"
      >
        <p class="font-semibold text-custom-teal-500">同步投影</p>
        <LocationBar :room="room" />
      </div>
      <div
        class="fh-[33.33%] md:h-[90%] py-5 text-lg w-full md:basis-1/3 border-t md:border-l md:border-t-0 border-custom-teal-700 flex items-center justify-between md:justify-center"
      >
        <p class="font-semibold text-custom-teal-500">同步投影</p>
        <LocationBar :room="room" />
      </div>
    </div>
  </div>
</template>

<script setup>
import TimelineCell from "@/components/agenda/TimelineCell.vue";
import SpeakerCell from "@/components/agenda/SpeakerCell.vue";
import LocationBar from "@/components/agenda/LocationBar.vue";

defineProps({
  speakerInfo: {
    type: Object,
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
});
</script>

<style lang="scss" scoped></style>

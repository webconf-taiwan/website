<template>
  <div class="flex flex-col md:flex-row min-h-[190px] gap-2 cursor-pointer">
    <TimelineCell :startTime="startTime" :endTime="endTime" />

    <div
      class="speaker-cell p-3 md:p-0 basis-full md:basis-[90%] flex flex-col md:flex-row border border-custom-teal-500 items-center"
      :data-speakerId="speakerInfo.id"
      @click="() => handleOpenSpeakerModal(speakerInfo.id)"
    >
      <div
        class="hover-no-border fh-[33.33%] md:h-[90%] py-5 text-lg w-full md:basis-1/3 border-b md:border-r md:border-b-0 border-custom-teal-700 flex items-center justify-between md:justify-center"
      >
        <p class="font-semibold text-custom-teal-500">同步聯播</p>
        <LocationBar room="1001" />
      </div>
      <div class="py-4 w-full h-full md:basis-1/3 md:px-5 md:py-4">
        <SpeakerCell
          :id="speakerInfo.id"
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
        <p class="font-semibold text-custom-teal-500">同步聯播</p>
        <LocationBar room="1003" />
      </div>
    </div>
  </div>
</template>

<script setup>
import TimelineCell from "@/components/agenda/TimelineCell.vue";
import SpeakerCell from "@/components/agenda/SpeakerCell.vue";
import LocationBar from "@/components/agenda/LocationBar.vue";

const props = defineProps({
  speakerInfo: {
    type: Object,
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
@media (min-width: 769px) {
  .speaker-cell {
    transition: background-color 0.3s, border-color 0.3s;
  }

  .speaker-cell:hover {
    background-color: #006a97;
  }

  .speaker-cell:hover .border-custom-teal-700 {
    border-color: #3ef0fc;
  }
}
</style>

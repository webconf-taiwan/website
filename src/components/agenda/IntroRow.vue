<template>
  <div class="flex flex-col md:flex-row min-h-[130px] gap-2">
    <TimelineCell :startTime="startTime" :endTime="endTime" />

    <div class="p-3 md:p-0 basis-full md:basis-[90%] flex flex-col md:flex-row border border-custom-teal-500 items-center">
      <div
        class="fh-[33.33%] md:h-[90%] py-5 text-lg w-full md:basis-1/3 border-b md:border-r md:border-b-0 border-custom-teal-700 flex items-center justify-between md:justify-center"
      >
        <p class="font-semibold text-custom-teal-500">同步聯播</p>
        <LocationBar room="1001" />
      </div>
      <div
        class="fh-[33.33%] md:h-[90%] py-5 text-lg w-full md:basis-1/3 border-b md:border-r md:border-b-0 border-custom-teal-700 flex items-center justify-between md:justify-center"
      >
        <p class="font-semibold text-white">引言</p>
        <LocationBar room="1101" />
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
import LocationBar from "@/components/agenda/LocationBar.vue";

defineProps({
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
});
</script>

<style scoped></style>

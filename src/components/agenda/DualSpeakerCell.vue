<template>
  <div class="h-full flex flex-col justify-between">
    <div class="mb-4 md:mb-0">
      <h2 class="text-white text-lg mb-2 md:leading-tight">
        {{ speechTopic }}
      </h2>
      <div class="flex gap-2 mb-3 flex-wrap">
        <CategoryTag :tag="tag" v-for="tag in categoryTags" :key="tag" />
      </div>
    </div>

    <div class="flex justify-between">
      <div class="flex items-center gap-2">
        <img
          class="rounded-full h-10 w-10 border-custom-pink-700 border object-contain"
          :src="`/speaker-img/${dualSpeakerInfoArr[0].id}.jpg`"
        />
        <img
          class="rounded-full h-10 w-10 border-custom-pink-700 border object-contain -ml-5"
          :src="`/speaker-img/${dualSpeakerInfoArr[1].id}.jpg`"
        />

        <h3 class="text-custom-pink-700">
          {{ dualSpeakerInfoArr[0].altName }} / <br />
          {{ dualSpeakerInfoArr[1].altName }}
        </h3>
      </div>
      <LocationBar :room="room" />
    </div>
  </div>
</template>

<script setup>
import LocationBar from "@/components/agenda/LocationBar.vue";
import CategoryTag from "../CategoryTag.vue";

defineProps({
  dualSpeakerInfoArr: {
    type: Array,
  },
  speechTopic: {
    type: String,
  },
  room: {
    type: String,
  },
  categoryTags: {
    type: Array,
  },
});
</script>

<style scoped></style>

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

<template>
  <div class="flex flex-col justify-between h-full">
    <div class="mb-4 md:mb-0">
      <h2 class="mb-2 text-lg text-white md:leading-tight">
        {{ speechTopic }}
      </h2>
      <div class="flex flex-wrap gap-2 mb-3">
        <CategoryTag :tag="tag" v-for="tag in categoryTags" :key="tag" />
      </div>
    </div>

    <div class="flex justify-between">
      <div class="flex items-center gap-2">
        <img class="object-contain w-10 h-10 border rounded-full border-custom-pink-700" :src="`/speaker-img/${dualSpeakerInfoArr[0].id}.jpg`" />
        <img
          class="object-contain w-10 h-10 -ml-5 border rounded-full border-custom-pink-700"
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

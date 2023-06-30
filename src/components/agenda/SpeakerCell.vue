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
          :src="`/speaker-img/${id}.jpg`"
        />
        <h3 class="text-custom-pink-700">
          {{ speakerName }} <span v-if="altName !== ''">{{ `(${altName})` }}</span>
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
  id: {
    type: String,
  },
  speechTopic: {
    type: String,
  },
  categoryTags: {
    type: Array,
  },
  speakerName: {
    type: String,
  },
  altName: {
    type: String,
  },
  room: {
    type: String,
  },
});
</script>

<style scoped></style>

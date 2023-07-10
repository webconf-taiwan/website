<template>
  <div class="text-custom-pink-700 md:hidden flex justify-center items-center text-base">
    <iconLocation class="stroke-current mr-2" />
    <p class="pt-1">講廳 {{ room }}</p>
  </div>
</template>

<script setup>
import iconLocation from "@/assets/images/icon/ic_location_s.svg";

defineProps({
  room: {
    type: String,
  },
});
</script>

<style>
.stroke-current path {
  stroke: currentColor;
}
</style>

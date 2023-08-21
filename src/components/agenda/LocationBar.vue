<script setup>
import iconLocation from "@/assets/images/icon/ic_location_s.svg";

defineProps({
  room: {
    type: String,
  },
});
</script>

<template>
  <div class="text-custom-pink-700 md:hidden flex justify-between items-center text-base w-[95px]">
    <iconLocation class="mr-2 stroke-current" />
    <p class="pt-1">講廳 {{ room }}</p>
  </div>
</template>

<style>
.stroke-current path {
  stroke: currentColor;
}
</style>

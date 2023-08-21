<template>
  <div class="flex gap-2">
    <div class="hidden md:block md:basis-[10%] gap-2"></div>
    <div class="w-full md:basis-[90%] flex text-custom-teal-500 justify-center py-4 text-lg font-semibold">
      {{ text }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
  },
});
</script>

<style lang="scss" scoped></style>

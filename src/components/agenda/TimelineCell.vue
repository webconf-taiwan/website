<template>
  <div class="bg-black sticky md:static top-[105.5px] pt-2 -mt-2 md:pt-0 md:mt-0 md:basis-[10%]">
    <div
      class="h-full font-semibold text-2xl md:text-2xl bg-custom-teal-700 md:bg-transparent px-2 py-3 md:px-0 md:py-5 md:basis-[10%] text-custom-teal-500 flex flex-row md:flex-col justify-between items-center"
    >
      <p>{{ startTime }}</p>
      <div class="grow flex justify-center items-center">
        <div
          class="w-[80%] border-t md:border-t md:border-l border-custom-teal-500 h-[1px] md:h-1/2"
        ></div>
      </div>
      <p>{{ endTime }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
});
</script>

<style lang="scss" scoped></style>

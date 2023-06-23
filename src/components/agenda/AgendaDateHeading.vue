<template>
  <button
    @click="onActiveDateClick"
    class="flex py-3 border bg-custom-gray-800 border-b-custom-teal-500 justify-center items-center w-full"
    :class="dateHeadingBorderClass"
  >
    <div
      class="flex-grow h-[70%] border-t border-b border-r flex items-center"
      :class="dateHeadingDecorateClass"
    >
      <div class="border-t border-b h-1/3 w-full" :class="dateHeadingDecorateClass"></div>
    </div>
    <p class="mx-3 md:mx-5 font-medium text-2xl" :class="dateHeadingTextClass"><slot></slot></p>

    <div
      class="flex-grow h-[70%] border-t border-b border-l flex items-center"
      :class="dateHeadingDecorateClass"
    >
      <div class="border-t border-b h-1/3 w-full" :class="dateHeadingDecorateClass"></div>
    </div>
  </button>
</template>

<script setup>
import { defineProps, computed } from "vue";

const props = defineProps({
  isActive: {
    type: Boolean,
  },
  isRight: {
    type: Boolean,
  },
  onActiveDateClick: {
    type: Function,
  },
});

const dateHeadingBorderClass = computed(() => ({
  "border-custom-teal-500": props.isActive,
  "border-custom-teal-700": !props.isActive,
  "border-l-0": props.isRight && !props.isActive,
  "border-r-0": !props.isRight && !props.isActive,
}));

const dateHeadingDecorateClass = computed(() => ({
  "border-custom-teal-500": props.isActive,
  "border-custom-teal-700": !props.isActive,
  invisible: !props.isActive,
}));

const dateHeadingTextClass = computed(() => ({
  "text-custom-teal-500": props.isActive,
  "text-custom-teal-700": !props.isActive,
}));
</script>

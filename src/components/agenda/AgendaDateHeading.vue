<template>
  <button
    @click="onActiveDateClick"
    class="flex items-center justify-center w-full py-3 border bg-custom-gray-800 border-b-custom-teal-500"
    :class="dateHeadingBorderClass"
  >
    <div class="flex-grow h-[70%] border-t border-b border-r flex items-center" :class="dateHeadingDecorateClass">
      <div class="w-full border-t border-b h-1/3" :class="dateHeadingDecorateClass"></div>
    </div>
    <p class="mx-3 text-2xl font-medium md:mx-5" :class="dateHeadingTextClass"><slot></slot></p>

    <div class="flex-grow h-[70%] border-t border-b border-l flex items-center" :class="dateHeadingDecorateClass">
      <div class="w-full border-t border-b h-1/3" :class="dateHeadingDecorateClass"></div>
    </div>
  </button>
</template>

<script setup>
import { computed } from "vue";

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

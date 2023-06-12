<template>
  <div
    class="py-1 px-2 inline-block bg-black border border-custom-teal-700 rounded text-custom-teal-500"
  >
    # {{ tag }}
  </div>
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
  tag: {
    type: String,
    required: true,
  },
});
</script>

<style scoped></style>

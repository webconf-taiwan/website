<script setup>
defineProps({
  tag: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="inline-block px-2 py-1 bg-black border rounded max-h-9 border-custom-teal-700 text-custom-teal-500"># {{ tag }}</div>
</template>

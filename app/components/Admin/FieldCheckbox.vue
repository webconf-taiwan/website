<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true }
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="flex items-center gap-2">
    <input
      type="checkbox"
      :checked="modelValue"
      class="size-4 border-gray-300"
      @change="$emit('update:modelValue', $event.target.checked)"
    >
    <span class="text-caption text-txt-light">{{ label }}</span>
  </label>
</template>

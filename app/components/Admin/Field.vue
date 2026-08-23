<!--
  單一欄位（label + input/textarea）。multiline 決定要不要吃 textarea，
  一個元件兩種模式，而不是拆兩支，是因為兩者只差一個標籤，欄位樣式/label
  排版要完全一致沒必要拆。
-->
<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  multiline: { type: Boolean, default: false },
  type: { type: String, default: 'text' }
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="block">
    <span class="text-caption text-txt-light">{{ label }}</span>
    <span v-if="hint" class="text-caption ml-1 text-txt-super-light">（{{ hint }}）</span>
    <textarea
      v-if="multiline"
      :value="modelValue"
      rows="3"
      class="text-body-sm mt-1 block w-full border border-gray-300 px-3 py-2 text-txt-dark outline-none focus:border-brand"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <input
      v-else
      :type="type"
      :value="modelValue"
      class="text-body-sm mt-1 block w-full border border-gray-300 px-3 py-2 text-txt-dark outline-none focus:border-brand"
      @input="$emit('update:modelValue', $event.target.value)"
    >
  </label>
</template>

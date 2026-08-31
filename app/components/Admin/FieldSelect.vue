<!--
  單一欄位（label + select），跟 Field.vue 是同一組，只是 input 換成 select。
  給「值只能是固定幾種」的欄位用（例如連結開啟方式 _self / _blank）——用文字框
  讓人手打 value 字串，打錯字或打成別的值都不會報錯，換成下拉選單直接把選項
  限定死，不會打錯。
-->
<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  // [{ value, label }]
  options: { type: Array, required: true }
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="block">
    <span class="text-caption text-txt-light">{{ label }}</span>
    <span v-if="hint" class="text-caption ml-1 text-txt-super-light">（{{ hint }}）</span>
    <select
      :value="modelValue"
      class="text-body-sm mt-1 block w-full border border-gray-300 bg-white px-3 py-2 text-txt-dark outline-none focus:border-brand"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </label>
</template>

<!--
  單一欄位（label + input/textarea）。multiline 決定要不要吃 textarea，
  一個元件兩種模式，而不是拆兩支，是因為兩者只差一個標籤，欄位樣式/label
  排版要完全一致沒必要拆。

  disabled：給「顯示但禁止修改」的欄位用（例如選單設定頁裡跟前台版面規則
  綁定的連結網址）。用原生 input[disabled] 而不是拿掉 input 換成純文字，
  是因為欄位排版（label 對齊、寬度）要跟其他可編輯欄位長得一模一樣，使用者
  一眼就能分辨「這欄跟旁邊欄位是同一組資料，只是這欄不能動」。
-->
<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  multiline: { type: Boolean, default: false },
  type: { type: String, default: 'text' },
  disabled: { type: Boolean, default: false }
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
      :disabled="disabled"
      rows="3"
      class="text-body-sm mt-1 block w-full border border-gray-300 px-3 py-2 text-txt-dark outline-none focus:border-brand disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-txt-light"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <input
      v-else
      :type="type"
      :value="modelValue"
      :disabled="disabled"
      class="text-body-sm mt-1 block w-full border border-gray-300 px-3 py-2 text-txt-dark outline-none focus:border-brand disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-txt-light"
      @input="$emit('update:modelValue', $event.target.value)"
    >
  </label>
</template>

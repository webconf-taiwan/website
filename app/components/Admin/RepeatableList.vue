<!--
  給「陣列型」欄位共用的容器：讲者、票種、贊助商、FAQ⋯這些區塊結構都不一樣，
  但「一筆一筆卡片 + 新增/刪除」的操作邏輯是共通的，所以抽成一個元件，
  每個區塊只要透過 #item slot 決定卡片裡面長怎樣，不用每個區塊各刻一次
  新增/刪除按鈕跟排版。

  v-model 綁父層的陣列（例如 section.items）：新增/刪除都是整包陣列
  emit 出去，不在這裡改 props 本身（Vue 的 props 是單向資料流，直接改
  modelValue.value 會在嚴格模式下噴警告）。
-->
<script setup>
const props = defineProps({
  modelValue: { type: Array, required: true },
  newItem: { type: Function, required: true },
  addLabel: { type: String, default: '新增一筆' },
  emptyLabel: { type: String, default: '目前沒有任何項目' }
})
const emit = defineEmits(['update:modelValue'])

function addItem () {
  emit('update:modelValue', [...props.modelValue, props.newItem()])
}

function removeItem (index) {
  const next = [...props.modelValue]
  next.splice(index, 1)
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p v-if="!modelValue.length" class="text-caption text-txt-super-light">
      {{ emptyLabel }}
    </p>

    <div
      v-for="(item, index) in modelValue"
      :key="index"
      class="relative border border-gray-200 bg-gray-50 p-4"
    >
      <button
        type="button"
        class="text-caption absolute right-3 top-3 text-txt-light hover:text-red-600"
        title="刪除這一筆"
        @click="removeItem(index)"
      >
        刪除 ✕
      </button>
      <div class="flex flex-col gap-3 pr-16">
        <slot name="item" :item="item" :index="index" />
      </div>
    </div>

    <AtomButton
      intent="outline"
      size="sm"
      rounded="none"
      :text="addLabel"
      class="self-start"
      @click="addItem"
    />
  </div>
</template>

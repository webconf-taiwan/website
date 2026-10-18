<script setup>
// 講者頁的標籤篩選（Figma：Skills Container）。可複選；什麼都沒勾 = 全部。
// 桌機掛在 PlatePage 左欄（rail slot），手機放在名單上方 —— 兩份共用同一個 v-model，各自收合。
const props = defineProps({
  label: { type: String, default: '' },
  allLabel: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  defaultOpen: { type: Boolean, default: true },
})

const selected = defineModel({ type: Array, default: () => [] })
const open = ref(props.defaultOpen)
const listId = useId()

// 設計稿是兩欄、先由上往下排滿左欄（全部、AI、Frontend… 再換到右欄）
const entries = computed(() => [{ value: null, text: props.allLabel }, ...props.options.map(value => ({ value, text: value }))])
const rows = computed(() => Math.ceil(entries.value.length / 2))

function isActive (value) {
  return value === null ? selected.value.length === 0 : selected.value.includes(value)
}
// 展開／收合完頁面高度變了（窄視窗上篩選在名單上方），讓 ScrollTrigger 重新量測
function onToggled (e) {
  if (e.propertyName === 'grid-template-rows') useNuxtApp().$ScrollTrigger?.refresh()
}

function toggle (value) {
  if (value === null) selected.value = []
  else if (selected.value.includes(value)) selected.value = selected.value.filter(v => v !== value)
  else selected.value = [...selected.value, value]
}
</script>

<template>
  <div class="w-full border border-pre-800/80 bg-bg-mid/70 backdrop-blur-[8px] lg:w-[300px]">
    <button
      type="button"
      class="flex w-full items-center justify-between border-b px-4 py-2 text-left text-zh-body-md text-pre-800 transition-colors duration-300"
      :class="open ? 'border-pre-800/35' : 'border-transparent'"
      :aria-expanded="open"
      :aria-controls="listId"
      @click="open = !open"
    >
      <span :class="{ 'font-medium': open }">{{ label }}</span>
      <!-- 加號轉 90° 交叉淡入成減號 -->
      <span class="relative size-5 shrink-0" aria-hidden="true">
        <AtomIcon name="plus" class="absolute inset-0 size-5 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none" :class="open ? 'rotate-90 opacity-0' : 'opacity-100'" />
        <AtomIcon name="minus" class="absolute inset-0 size-5 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none" :class="open ? 'opacity-100' : '-rotate-90 opacity-0'" />
      </span>
    </button>

    <!-- 展開：grid-template-rows 0fr → 1fr，高度直接漸變到內容的實際高度，不用量。
         收合時用 inert，看不到的按鈕不會被 Tab 到。 -->
    <div
      :id="listId"
      class="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
      :class="open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
      :inert="!open"
      @transitionend.self="onToggled"
    >
      <div class="min-h-0 overflow-hidden">
        <ul
          class="grid grid-flow-col grid-cols-2 gap-x-4 gap-y-1 px-4 pb-6 pt-[18px]"
          :style="{ gridTemplateRows: `repeat(${rows}, auto)` }"
        >
          <!-- 展開時由上往下依序浮上來（左欄排完才換右欄，延遲跟著排列順序）；收合時一起淡出 -->
          <li
            v-for="(entry, i) in entries"
            :key="entry.text"
            class="transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none"
            :class="open ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'"
            :style="{ transitionDelay: open ? `${60 + i * 25}ms` : '0ms' }"
          >
            <button
              type="button"
              class="flex items-center gap-1 text-zh-body-md font-medium text-pre-800"
              :aria-pressed="isActive(entry.value)"
              @click="toggle(entry.value)"
            >
              <span
                aria-hidden="true"
                class="size-2 shrink-0 transition-colors duration-200"
                :class="isActive(entry.value) ? 'bg-pre-800' : 'border border-pre-800/35'"
              />
              {{ entry.text }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

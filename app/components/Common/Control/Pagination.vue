<script setup>
// 分頁控制。目前用於 PL.V 常見問答，但刻意做成與內容無關的通用元件。
//
// 用法：
//   <CommonControlPagination v-model:page="page" :total="10" />
//
// 省略號的規則：中間永遠顯示 WINDOW 頁的連續視窗，視窗貼齊頭尾時不重複顯示 1 / total。
//   page=1  total=10 → 1 2 3 … 10        （設計稿的樣子）
//   page=5  total=10 → 1 … 4 5 6 … 10
//   page=10 total=10 → 1 … 8 9 10

const props = defineProps({
  page: {
    type: Number,
    default: 1,
  },
  total: {
    type: Number,
    default: 1,
  },
  // 中間連續視窗要顯示幾頁
  window: {
    type: Number,
    default: 3,
  },
})

const emit = defineEmits(['update:page'])

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// 產出要渲染的項目：數字 = 頁碼，null = 省略號
const items = computed(() => {
  const total = Math.max(1, props.total)
  const win = Math.max(1, Math.min(props.window, total))
  const current = clamp(props.page, 1, total)

  // 視窗起點：讓 current 盡量落在中間，但不能超出兩端
  const start = clamp(current - Math.floor(win / 2), 1, Math.max(1, total - win + 1))
  const end = Math.min(total, start + win - 1)

  const out = []
  if (start > 1) {
    out.push(1)
    // 只差一頁就不必用省略號，直接把那一頁列出來比較好按
    if (start === 3) out.push(2)
    else if (start > 3) out.push(null)
  }
  for (let p = start; p <= end; p++) out.push(p)
  if (end < total) {
    if (end === total - 2) out.push(total - 1)
    else if (end < total - 2) out.push(null)
    out.push(total)
  }
  return out
})

const canPrev = computed(() => props.page > 1)
const canNext = computed(() => props.page < props.total)

function go (p) {
  const next = clamp(p, 1, Math.max(1, props.total))
  if (next !== props.page) emit('update:page', next)
}
</script>

<template>
  <nav
    v-if="total > 1"
    aria-label="分頁"
    class="flex items-center justify-center gap-x-5 font-mono text-[14px] text-pre-800/[62%]"
  >
    <button
      type="button"
      aria-label="上一頁"
      :disabled="!canPrev"
      class="transition-colors hover:text-pre-800 disabled:pointer-events-none disabled:opacity-30"
      @click="go(page - 1)"
    >
      ←
    </button>

    <template v-for="(item, i) in items" :key="item === null ? `gap-${i}` : item">
      <!-- 省略號不是按鈕，也不該被讀出來 -->
      <span v-if="item === null" aria-hidden="true">…</span>
      <button
        v-else
        type="button"
        :aria-label="`第 ${item} 頁`"
        :aria-current="item === page ? 'page' : undefined"
        class="transition-colors hover:text-pre-800"
        :class="item === page ? 'text-pre-800' : ''"
        @click="go(item)"
      >
        {{ item }}
      </button>
    </template>

    <button
      type="button"
      aria-label="下一頁"
      :disabled="!canNext"
      class="transition-colors hover:text-pre-800 disabled:pointer-events-none disabled:opacity-30"
      @click="go(page + 1)"
    >
      →
    </button>
  </nav>
</template>

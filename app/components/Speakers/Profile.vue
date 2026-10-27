<script setup>
// 講者頁的一張講者卡（Figma：Profile）。
// 桌機是四欄格子裡的直式卡（大方形照片在上）；窄視窗是橫列（80px 小照片在左、文字在右），
// 列與列之間的虛線由頁面那層的 <li> 畫。
// 照片右上角的 day 要等議程排定，資料沒有就不印。
const props = defineProps({
  data: { type: Object, default: () => ({}) },
  // 卡片左上角的 SPEC.01 —— 依完整名單的順序編號，篩選時不重排
  spec: { type: String, default: '' },
  // 篩選沒選中：照片框變淡（設計稿 opacity 30%），文字與 SPEC 標籤照舊
  dimmed: { type: Boolean, default: false },
  // 目前篩選選中的標籤：卡片上對到的那幾個改用 accent-1（設計稿）
  highlight: { type: Array, default: () => [] },
})

const item = computed(() => props.data || {})
const orgLines = computed(() => [item.value, item.value.extra]
  .filter(line => line?.org || line?.role)
  .map(line => [line.org, line.role].filter(Boolean)))
</script>

<template>
  <article class="flex gap-4 py-6 lg:flex-col lg:gap-[14px] lg:py-0">
    <div data-fade="in" class="relative size-20 shrink-0 overflow-hidden bg-pre-800/5 lg:aspect-square lg:size-auto lg:w-full">
      <!-- 變淡放在裡面這層：外層的 opacity 由 data-fade 進場動畫控制 -->
      <div class="absolute inset-0 transition-opacity duration-500" :class="{ 'opacity-30': dimmed }">
        <img
          :src="item.portrait"
          :alt="item.name"
          width="1000"
          height="1000"
          loading="lazy"
          decoding="async"
          class="block size-full object-cover"
        >
      </div>
      <div class="absolute inset-x-0 top-0 hidden items-center justify-between px-2 py-1 font-mono text-fs-meta text-pre-800/[62%] lg:flex">
        <p>{{ spec }}</p>
        <p v-if="item.day">{{ item.day }}</p>
      </div>
    </div>

    <div class="flex min-w-0 flex-1 flex-col gap-2 lg:flex-none lg:gap-3">
      <div class="flex flex-col gap-2">
        <h3 data-fade="in" class="font-zh-serif text-fs-zh-h5 font-medium text-pre-800 [word-break:keep-all]">
          <span v-for="(r, k) in nameRuns(item.name)" :key="k" :class="r.zh ? '' : 'font-en-serif italic'">{{ r.t }}</span>
        </h3>
        <p
          v-for="(line, i) in orgLines"
          :key="i"
          data-fade="in"
          class="flex flex-wrap items-center gap-1 font-mono text-body-sm tracking-[0.06em] text-pre-800/[62%]"
        >
          <template v-for="(part, j) in line" :key="j">
            <span v-if="j > 0" aria-hidden="true" class="text-accent-1">·</span>
            <span>{{ part }}</span>
          </template>
        </p>
      </div>

      <ul data-fade="in" class="flex flex-wrap gap-x-2 gap-y-1 border-t border-dashed border-pre-800/35 pt-2 font-mono text-fs-meta text-pre-800/[62%] lg:gap-2 lg:pt-3">
        <li
          v-for="skill in item.skills"
          :key="skill"
          class="transition-colors duration-300"
          :class="{ 'text-accent-1': highlight.includes(skill) }"
        >
          #{{ skill }}
        </li>
      </ul>
    </div>
  </article>
</template>

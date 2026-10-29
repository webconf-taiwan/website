<script setup>
// 議程表裡的一格場次（Figma：card）。
// 桌機是三欄表格的一格，hover 時底下的藍色漸層像光線由左往右升起（文字不動）；
// 窄視窗是一列，右下角多一個場館標示（桌機由表頭看出場館，不用印）。
const props = defineProps({
  // useAgendaData 攤平過的場次：{ title, skills, speakers: [{ name, title, portrait }] }
  data: { type: Object, default: () => ({}) },
  room: { type: String, default: '' },
  // 標籤篩選沒選中：整格變淡（同講者頁），位置不動
  dimmed: { type: Boolean, default: false },
})

const session = computed(() => props.data || {})
const skills = computed(() => session.value.skills || [])
const speakers = computed(() => session.value.speakers || [])
</script>

<template>
  <article class="agenda-session flex h-full overflow-clip lg:pb-6 lg:pt-4">
    <div class="agenda-session-body flex min-w-0 flex-1 flex-col justify-between gap-6 py-6 lg:px-4" :class="{ 'opacity-30': dimmed }">
      <div class="flex flex-col gap-2">
        <h4 class="text-zh-h6 text-pre-800">{{ session.title }}</h4>
        <ul v-if="skills.length" class="flex flex-wrap gap-x-2 gap-y-1 text-body-sm text-pre-800/[62%]">
          <li v-for="skill in skills" :key="skill">#{{ skill }}</li>
        </ul>
      </div>

      <div class="flex items-end gap-3">
        <!-- 頭像兩個一排（對談四位就是 2×2），名字在右邊一行一位、用 · 接起來 -->
        <div v-if="speakers.length" class="flex w-max max-w-[100px] shrink-0 flex-wrap gap-1">
          <div v-for="person in speakers" :key="person.name" class="size-12 overflow-hidden bg-pre-800/5">
            <img
              v-if="person.portrait"
              :src="person.portrait"
              alt=""
              width="48"
              height="48"
              loading="lazy"
              decoding="async"
              class="block size-full object-cover"
            >
          </div>
        </div>
        <p class="flex min-w-0 flex-1 flex-col gap-1 self-center text-body-sm text-pre-800">
          <span v-for="(person, i) in speakers" :key="person.name">
            {{ person.name }}<span v-if="i < speakers.length - 1" aria-hidden="true" class="text-accent-1"> ·</span>
          </span>
        </p>
        <p class="flex shrink-0 items-center gap-1 text-body-sm text-pre-800 lg:hidden">
          <AtomIcon name="geo-alt" class="size-4" />
          {{ room }}
        </p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.agenda-session-body { transition: opacity 500ms ease; }

/* hover：文字不動，藍色漸層像光線一樣由左往右升起。
   漸層本身不變形，是蓋在上面的遮罩往右推：遮罩圖是元素的 3 倍寬、中間 1/3 是柔邊，
   mask-position 100% → 0% 時柔邊從左緣掃到右緣，亮的部分跟著一路鋪滿。 */
@media (min-width: 1024px) and (hover: hover) {
  .agenda-session-body {
    position: relative;
    isolation: isolate;
  }
  .agenda-session-body::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background-image: linear-gradient(to right, rgb(15 29 78 / 80%), rgb(15 29 78 / 30%) 65.385%, rgb(15 29 78 / 10%));
    -webkit-mask-image: linear-gradient(to right, #000 33.333%, transparent 66.667%);
    mask-image: linear-gradient(to right, #000 33.333%, transparent 66.667%);
    -webkit-mask-size: 300% 100%;
    mask-size: 300% 100%;
    -webkit-mask-position: 100% 0;
    mask-position: 100% 0;
    opacity: 0;
    transition:
      opacity 500ms ease,
      -webkit-mask-position 700ms cubic-bezier(0.22, 1, 0.36, 1),
      mask-position 700ms cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: none;
  }
  .agenda-session:hover .agenda-session-body::before {
    -webkit-mask-position: 0 0;
    mask-position: 0 0;
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .agenda-session-body::before {
    -webkit-mask-image: none;
    mask-image: none;
  }
}
</style>

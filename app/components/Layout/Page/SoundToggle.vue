<script setup>
// 背景音開關（header 用）。狀態與規則見 plugins/sound.client.js：預設開、選擇記在瀏覽器。
//
// 圖示是四根小柱：
//   在響                → 柱子像波形一樣上下跳；hover 只變色，動態不變
//   沒在響（關，或開但瀏覽器還沒放行）→ 柱子靜止（關的時候壓成平線）；hover 才開始跳
//
// ⚠️ SSR 不知道 localStorage 裡存的是開還是關（伺服器那份一律當「開」），所以 mount 之前
// 一律照「開」畫，mount 後才換成真正的狀態 —— 不然存了「關」的人每次都 hydration mismatch。
const sound = useSiteSound()
const mounted = ref(false)
onMounted(() => { mounted.value = true })

const on = computed(() => !mounted.value || sound.enabled.value)
const playing = computed(() => mounted.value && sound.enabled.value && sound.audible.value)
const label = computed(() => (on.value ? '關閉背景音' : '開啟背景音'))
</script>

<template>
  <button
    type="button"
    class="sound-toggle flex size-6 shrink-0 items-center justify-center text-pre-800 transition-colors duration-300 hover:text-accent-1"
    :class="{ 'is-off': !on, 'is-playing': playing }"
    :aria-pressed="on"
    :aria-label="label"
    :title="label"
    @click="sound.toggle()"
  >
    <span class="flex h-3.5 items-center gap-[3px]" aria-hidden="true">
      <span
        v-for="i in 4"
        :key="i"
        class="sound-bar block h-full w-[2px] origin-center rounded-full bg-current"
        :style="{ animationDelay: `${(i - 1) * -0.27}s` }"
      />
    </span>
  </button>
</template>

<style scoped>
.sound-bar { transition: transform 0.3s ease; }

/* 靜止時的高低錯落（像一個定格的波形） */
.sound-bar:nth-child(1) { transform: scaleY(0.45); }
.sound-bar:nth-child(2) { transform: scaleY(0.85); }
.sound-bar:nth-child(3) { transform: scaleY(0.6); }
.sound-bar:nth-child(4) { transform: scaleY(0.35); }

/* 關：平線 */
.is-off .sound-bar { transform: scaleY(0.14); }

/* 在響：波形跳動（hover 只有按鈕本身的變色） */
.is-playing .sound-bar { animation: sound-bar 1.1s ease-in-out infinite; }

/* 沒在響：hover 才跳 —— 暗示「按下去會有聲音」 */
.sound-toggle:not(.is-playing):hover .sound-bar { animation: sound-bar 0.8s ease-in-out infinite; }

@keyframes sound-bar {
  0%, 100% { transform: scaleY(0.25); }
  50% { transform: scaleY(1); }
}

@media (prefers-reduced-motion: reduce) {
  .sound-bar { animation: none !important; }
}
</style>

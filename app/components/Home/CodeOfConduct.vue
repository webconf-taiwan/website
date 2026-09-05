<script setup>
// PL. VII — Code of Conduct。位於票券／贊助商與 Footer 之間。
//
// 這一區沒有自己的粒子 canvas —— 它的視覺主體是「把背後的背景粒子場糊掉」的那塊
// 毛玻璃。設計稿裡是一個 1547×533 的圓角矩形（x=-49，比 1440 的版面左右各多 49px），
// 也就是刻意出血到畫面外，所以左右圓角實際上看不到，只會看到一片糊掉的底。
//
// ⚠️ 出血的那 49px 會撐出水平捲軸，section 一定要 overflow-clip。
//
// 為什麼用 backdrop-blur 而不是自己放一張模糊圖：背後是即時運算的粒子場，
// 它一直在動，只有 backdrop-filter 才會跟著糊。

const props = defineProps({
  // 首頁資料的 code_of_conduct 區塊
  data: {
    type: Object,
    default: () => ({})
  },
  // 區塊內建的那串章節錨點。頁面已經有 fixed 的 CommonChapterNav 時要關掉，
  // 否則兩串會疊在同一個位置（一鏡到底版的首頁就是這個情況）。
  showChapterDots: {
    type: Boolean,
    default: true
  }
})

const content = computed(() => props.data || {})

const sectionRef = ref(null)
const { fadeIn, killFadeIns } = useFadeIn()

onMounted(() => fadeIn(sectionRef.value))
onBeforeUnmount(() => killFadeIns())
</script>

<template>
  <section
    id="code-of-conduct"
    ref="sectionRef"
    class="relative z-10 overflow-clip border-t border-pre-800/35"
  >
    <!-- 毛玻璃底。左右各出血 48px（設計稿是 49），所以圓角落在畫面外、看不到。
         bg 只給極淡的一層，主要效果來自 backdrop-blur —— 太濃會把粒子完全蓋掉，
         就失去「隱約看得到背後生態」的層次。
         ⚠️ 垂直方向一定要 inset-y-0 滿版。設計稿的矩形上下各內縮約 10px，照做的話
         區塊上下緣會露出一條沒糊到的清晰粒子帶，非常明顯。 -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -inset-x-12 inset-y-0 rounded-[24px] bg-white/[0.03] backdrop-blur-[32px]"
    />

    <div class="relative z-1 mx-auto max-w-[872px] px-6 py-16 lg:py-[92px]">
      <p data-fade="in" class="font-mono text-[12px] leading-[1.2] tracking-[0.2em] text-pre-800/80">
        {{ content.plate?.code }}
      </p>

      <!-- ⚠️ 這裡的藍是 #71c1f0，與 PL.IV 的 By MRT / By Train 同一支，
           不是 token 的 accent-1 (#7cc8f2)。設計稿兩種藍並存。 -->
      <h2
        data-fade="in"
        class="mt-6 font-serif text-[28px] font-bold italic leading-[1.2] tracking-[0.02em] text-[#71c1f0] lg:text-[32px]"
      >
        {{ content.title }}
      </h2>

      <p
        data-fade="in"
        class="mt-8 font-Noto text-[15px] leading-[1.75] tracking-[0.04em] text-pre-800/[85%] lg:text-[16px]"
      >
        {{ content.body_zh }}
      </p>

      <p
        data-fade="in"
        class="mt-6 font-serif text-[13px] leading-[1.7] tracking-[0.06em] text-pre-800/[50%] lg:text-[14px]"
      >
        {{ content.body_en }}
      </p>
    </div>

    <!-- 章節錨點：PL.VII 亮第 7 顆。
         ⚠️ 這是區塊內建的靜態版本（跟著區塊捲、不能點）。頁面層級的 fixed 版本是
         CommonChapterNav，用它的頁面要傳 :show-chapter-dots="false" 把這串關掉。 -->
    <div
      v-if="props.showChapterDots"
      aria-hidden="true"
      class="absolute left-[60px] top-1/2 hidden -translate-y-1/2 flex-col items-center lg:flex"
    >
      <span class="h-2.5 w-px bg-pre-800/35" />
      <template v-for="n in 7" :key="n">
        <span
          class="size-1 shrink-0 rounded-full"
          :class="n === 7 ? 'bg-accent-1' : 'border border-pre-800/35'"
        />
        <span v-if="n < 7" class="h-6 w-px bg-pre-800/35" />
      </template>
      <span class="h-2.5 w-px bg-pre-800/35" />
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  // 首頁資料的 sponsor 區塊（已經在 useHomeData 濾成 show_on_home 的那幾家）
  data: {
    type: Object,
    default: () => ({})
  }
})

const sponsors = computed(() => props.data?.items || [])
// 重複多份，確保任何螢幕寬度下 -50% 循環都無縫
const loopList = computed(() => [
  ...sponsors.value, ...sponsors.value, ...sponsors.value, ...sponsors.value
])

const sectionRef = ref(null)
const trackRef = ref(null)
let loop = null
let st = null

onMounted(() => {
  const { $gsap, $ScrollTrigger } = useNuxtApp()
  if (!$gsap || !trackRef.value) return

  loop = $gsap.to(trackRef.value, {
    xPercent: -50,
    duration: 18,
    ease: 'none',
    repeat: -1
  })

  if ($ScrollTrigger) {
    st = $ScrollTrigger.create({
      trigger: sectionRef.value,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        // 往下滾動 = 正向 (1)，往回滾動 = 反向 (-1)
        $gsap.to(loop, { timeScale: self.direction, duration: 0.4, overwrite: true })
      }
    })
  }
})

onBeforeUnmount(() => {
  st?.kill()
  loop?.kill()
})
</script>

<template>
  <!-- ⚠️ 不要給不透明底色。設計稿裡 logo 是直接疊在背景粒子場上的，
       加了 bg 會在票券與 CoC 之間切出一條看得見的暗帶。 -->
  <section
    id="sponsors"
    ref="sectionRef"
    class="relative z-10 overflow-hidden py-10"
  >
    <div ref="trackRef" class="flex w-max">
      <!-- 每一格是連到贊助商官網的連結。
           ⚠️ loopList 是同一份名單重複四份，只有第一份對輔助技術與鍵盤公開 ——
           不然一排 5 家會變成 20 個連結，tab 要按 20 次才走得完跑馬燈。 -->
      <a
        v-for="(s, i) in loopList"
        :key="i"
        :href="s.link?.href"
        :target="s.link?.target"
        :rel="linkRel(s.link?.target)"
        :aria-hidden="i >= sponsors.length ? 'true' : undefined"
        :tabindex="i >= sponsors.length ? -1 : undefined"
        class="flex shrink-0 items-center justify-center px-8 transition-opacity hover:opacity-70"
      >
        <!-- 現在的 logo 是設計稿直接切出來的 175px 寬圖磚：留白、字級、
             「連續 4 年贊助」那種標籤全都畫在圖裡了，所以這裡一律等寬顯示。
             ⚠️ 別再回頭讓資料給 logo_height 逐張調高度 —— 圖磚本來就對齊好了，
             逐張調反而會讓每個 logo 的視覺大小不一致。 -->
        <img
          :src="assetUrl(s.logo)"
          :alt="s.name"
          class="w-[175px] max-w-none object-contain"
          loading="lazy"
          draggable="false"
        >
      </a>
    </div>
  </section>
</template>

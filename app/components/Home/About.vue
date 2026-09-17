<script setup>
// PL. II — About。
//
// ⚠️ 這一區沒有自己的 canvas：桌機的粒子畫在背後那張 fixed canvas 上
// （所以 lg 以上只鋪半透明的 bg-black/30），窄視窗則是被外層那段不透明的黑底蓋掉。
// 底色為什麼掛在頁面那一層、而不是各區塊自己來，見 pages/index.vue 的註解。

const props = defineProps({
  // 首頁資料的 about 區塊
  data: {
    type: Object,
    default: () => ({})
  }
})

const content = computed(() => props.data || {})

// 進場：左欄卷號 → Skills 框 → 右欄標題 → 導言 → 中文 → 按鈕
const sectionRef = ref(null)
useFadeIn(sectionRef)
</script>

<template>
  <section
    id="about"
    ref="sectionRef"
    class="relative z-10 px-6 lg:bg-black/30 lg:px-12 2xl:px-20"
  >
    <div class="mx-auto grid max-w-[1680px] grid-cols-1 gap-12 border-t border-pre-800/35 pt-8 pb-[120px] lg:grid-cols-12 lg:gap-10">
      <!-- 左欄：卷號 + Skills 標本框 -->
      <div class="lg:col-span-4">
        <!-- divider 關掉：這一區的分隔線畫在外層 grid 容器上（要橫貫左右兩欄） -->
        <CommonPlate :data="content.plate" :divider="false" data-fade="in" />

        <!-- Skills 框：疊在背景粒子團上的「觀察框」。刻意留大量上方空白，
             讓框落在粒子團中段（設計稿的構圖）。 -->
        <div data-fade="in" class="relative hidden lg:block mt-24 max-w-[280px] lg:ml-16 lg:mt-40">
          <!-- 十字準星 -->
          <span class="pointer-events-none absolute -left-4 top-1/2 font-mono text-micro text-white/40">+</span>
          <!-- 底色與模糊跟票券卡同一組（TicketCard 的非 highlight 樣式），
               讓背後的粒子糊掉、字才讀得出來。
               ⚠️ 邊框維持原本的 white/25 —— 票券卡用的 border-pre-500/50 那個 /50
               不會生效（pre-500 不是 rgb 格式，opacity modifier 吃不到），
               線會變成不透明的淺灰，在這個框上太搶。 -->
          <div class="relative border border-white/25 bg-pre-800/10 px-4 py-5 backdrop-blur-md">
            <span class="absolute top-2.5 left-3 px-1 font-mono text-micro text-white/60">
              {{ content.skills_box_label }}
            </span>
            <ul class="space-y-1 text-right font-mono text-micro text-white/55">
              <li v-for="s in content.skills" :key="s">
                {{ s }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 右欄：主文案 -->
      <div class="lg:col-span-8 xl:col-span-7 lg:pb-6">
        <h2 data-fade="in" class="text-en-h1 italic mb-6 lg:mb-8 whitespace-pre-line">
          {{ content.heading }}
        </h2>

        <p data-fade="in" class="mb-6 lg:mb-8 text-en-h5 italic text-[#efe6d2]/90">
          <template v-for="(run, i) in content.lede_runs" :key="i">
            <span v-if="run.is_accent" class=" text-[#71c1f0]">{{ run.text }}</span>
            <template v-else>{{ run.text }}</template>
          </template>
        </p>

        <p data-fade="in" class="mb-6 lg:mb-8 text-zh-body-lg text-[#efe6d2]/75">
          {{ content.body_zh }}
        </p>

        <AtomButton
          data-fade="in"
          class="w-fit"
          intent="primary"
          size="md"
          rounded="none"
          :href="content.cta?.href"
          :target="content.cta?.target"
          :rel="linkRel(content.cta?.target)"
          :text="content.cta?.label"
        />
      </div>
    </div>
  </section>
</template>

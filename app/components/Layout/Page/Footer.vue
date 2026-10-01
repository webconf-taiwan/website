<script setup>
defineProps({ mobileLogo: { type: String, default: '' } })
// footer 不做進場淡入（設計決定）：內容直接顯示，不要再加 data-fade / useFadeIn。

const lenis = useLenis()

function scrollToTop() {
  lenis.scrollTo(0)
}

// 資料來自 app/constants/data/global.json（靜態，見 useSiteData）
const { footer } = useGlobalData()
</script>

<template>
  <footer class="relative grid grid-cols-1 gap-y-6 bg-[#0a0a0c] border-t border-pre-800/[35%] px-5 py-8 lg:gap-y-12 lg:px-10 lg:py-12 xl:grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)] xl:gap-x-20 2xl:gap-x-34">
    <div class="lg:max-w-96">
      <div data-footer-wordmark class="flex items-center gap-x-2 mb-6">
        <NuxtLink to="/">
          <picture>
            <source v-if="mobileLogo" media="(max-width: 1023px)" :srcset="assetUrl(mobileLogo)">
            <img class="h-7 w-28" :src="assetUrl(footer.logo.src)" :alt="footer.logo.alt">
          </picture>
        </NuxtLink>
        <p class="text-meta text-pre-800/80">{{ footer.tagline }}</p>
      </div>
      <div data-footer-copy class="flex flex-col gap-y-6 text-pre-800/[62%] italic text-en-body-md">
        <!-- 每段是一個「行」的陣列，行與行之間補 <br>。
             ⚠️ 不要改回把 <br> 寫在字串裡再 v-html —— 那等於讓資料源可以塞任意 HTML。 -->
        <div v-for="(lines, i) in footer.paragraphs" :key="i">
          <template v-for="(line, j) in lines" :key="j">
            <br v-if="j > 0">{{ line }}
          </template>
        </div>
      </div>
    </div>
    <nav aria-label="Footer" class="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 lg:gap-x-10 xl:gap-x-10 2xl:gap-x-14">
      <div v-for="parentMenu in footer.menu_groups" :key="parentMenu.title" :data-footer-group="parentMenu.title">
        <h2 class="text-en-h5 text-pre-800 italic mb-4">{{ parentMenu.title }}</h2>
        <ul class="flex flex-col gap-y-2">
          <li v-for="childMenu in parentMenu.links" :key="childMenu.label">
            <!-- ⚠️ 要用 NuxtLink，不能用 <a href>：<a> 點站內連結會整頁重新載入，
                 loading（LayoutPageIntro）就會再跑一次。NuxtLink 遇到 mailto: / https://
                 會自己輸出一般的 <a>，所以外部連結也可以一起用。 -->
            <NuxtLink
              class="group inline-flex items-center text-pre-800/80 text-zh-body-md transition-colors duration-300 lg:hover:text-brand-light"
              :to="childMenu.href"
              :target="childMenu.target"
              :rel="linkRel(childMenu.target)"
            >
              {{ childMenu.label }}
              <!-- hover 時箭頭從左邊滑入（只有桌機有 hover）。箭頭維持 pre-800，不跟著文字變藍。
                   平常就佔著位置只是透明，hover 才不會把同一行擠動。 -->
              <span
                aria-hidden="true"
                class="ml-2 text-pre-800 opacity-0 -translate-x-2 transition duration-300 motion-reduce:translate-x-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-x-0 lg:group-focus-visible:opacity-100"
              >→</span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </nav>
    <button
     
      type="button"
      :aria-label="footer.back_to_top_label"
      class="group absolute w-10 h-10 flex items-center justify-center right-5 top-0 -translate-y-1/2 bg-[#0a0a0c] border border-pre-800/[35%] text-pre-800 transition-colors duration-300 lg:right-10 lg:hover:border-brand-light lg:hover:text-brand-light"
      @click="scrollToTop"
    >
      <span class="pointer-events-none absolute inset-0 bg-[#71c1f0]/0 transition-colors duration-300 lg:group-hover:bg-[#71c1f0]/10"></span>
      <svg class="relative" width="5" height="12" viewBox="0 0 5 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 3.83333L2.5 0.5L0.5 3.83333M2.5 0.5L2.5 11.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </footer>
</template>

<script setup>
const lenis = useLenis()

function scrollToTop() {
  lenis.scrollTo(0)
}

// 資料來自 /api/global（與 Header 共用同一次請求，見 useSiteData）
const globalData = await useGlobalData()
const footer = computed(() => globalData.value.footer)
</script>

<template>
  <footer class="relative grid grid-cols-1 gap-y-6 bg-[#0a0a0c] border border-pre-800/[35%] px-5 py-8 lg:gap-y-12 lg:px-10 lg:py-12 xl:grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)] xl:gap-x-20 2xl:gap-x-34">
    <div class="lg:max-w-96">
      <div class="flex items-center gap-x-2 mb-6">
        <NuxtLink to="/">
          <img class="h-7 w-28" :src="assetUrl(footer.logo.src)" :alt="footer.logo.alt">
        </NuxtLink>
        <p class="text-fs-meta text-pre-800/80">{{ footer.tagline }}</p>
      </div>
      <div class="flex flex-col gap-y-6 text-pre-800/[62%] font-serif font-bold italic text-fs-btn">
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
      <div v-for="parentMenu in footer.menu_groups" :key="parentMenu.title">
        <h2 class="text-fs-h5 text-pre-800 italic mb-4">{{ parentMenu.title }}</h2>
        <ul class="flex flex-col gap-y-2">
          <li v-for="childMenu in parentMenu.links" :key="childMenu.label">
            <a
              class="text-pre-800/80 transition-colors duration-300 lg:hover:text-brand-light"
              :href="childMenu.href"
              :target="childMenu.target"
              :rel="linkRel(childMenu.target)"
            >
              {{ childMenu.label }}
            </a>
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

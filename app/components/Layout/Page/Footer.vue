<script setup>
const lenis = useLenis()

function scrollToTop() {
  lenis.scrollTo(0)
}

const footerIntro = {
  logo: { src: '/logo-webconf.svg', alt: 'WebConf' },
  tagline: 'Taiwan · 2026',
  paragraphs: [
    'A field study of the living web. Held at POPOP Taipei, Dec. 11–12, 2026.',
    'Visual identity by MonoLab.<br>WebConf Taiwan 2026 All Rights Reserved.'
  ]
}

// TODO: href 先放 '#' 佔位，實際連結請自行補上
const footerMenu = [
  {
    title: 'Programme',
    links: [
      { label: '議程資訊', href: '#' },
      { label: '講者陣容', href: '#' },
      { label: '場域介紹', href: '#' },
      { label: '前往購票', href: '#' }
    ]
  },
  {
    title: 'Codex',
    links: [
      { label: '贊助廠商', href: '#' },
      { label: '主辦團隊', href: '#' },
      { label: '歷史回顧', href: '#' },
      { label: '簽到牆', href: '#' }
    ]
  },
  {
    title: 'Connect',
    links: [
      { label: 'MAIL', href: 'mailto:#' },
      { label: 'FACEBOOK', href: '#' },
      { label: 'INSTAGRAM', href: '#' },
      { label: 'THREADS', href: '#' }
    ]
  }
]
</script>

<template>
  <footer class="relative flex flex-col gap-y-6 bg-[#0a0a0c] border border-pre-800/[35%] px-5 py-8 lg:flex-row lg:gap-x-34 lg:px-auto lg:pl-10 lg:py-12">
    <div class="lg:w-96">
      <div class="flex items-center gap-x-2 mb-6">
        <a href="./">
          <img class="w-35 h-10" :src="footerIntro.logo.src" :alt="footerIntro.logo.alt">
        </a>
        <p class="text-fs-meta text-pre-800/80">{{ footerIntro.tagline }}</p>
      </div>
      <div class="flex flex-col gap-y-6 text-pre-800/[62%] font-serif font-bold italic text-fs-btn">
        <div v-for="paragraph in footerIntro.paragraphs" :key="paragraph" v-html="paragraph"></div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-x-4 gap-y-8 lg:flex lg:flex-row lg:gap-x-14">
      <div v-for="parentMenu in footerMenu" :key="parentMenu.title" class="lg:w-54">
        <h2 class="text-fs-h5 text-pre-800 italic mb-4">{{ parentMenu.title }}</h2>
        <ul class="flex flex-col gap-y-2">
          <li v-for="childMenu in parentMenu.links" :key="childMenu.label">
            <a
              class="text-pre-800/80 transition-colors duration-300 lg:hover:text-brand-light"
              :href="childMenu.href"
            >
              {{ childMenu.label }}
            </a>
          </li>
        </ul>
      </div>
    </div>
    <button
      type="button"
      aria-label="回到頁面頂端"
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

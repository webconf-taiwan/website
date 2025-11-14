<script setup lang="ts">
import { EXTERNAL_LINKS } from '~/constants/externalLinks'

const NAV_ITEMS = [
  {
    name: '議程資訊',
    enName: 'Agenda',
    href: '/agendas',
    isTablet: true,
    isDesktop: true,
  },
  {
    name: '講者陣容',
    enName: 'Speakers',
    href: '/speakers',
    isTablet: false,
    isDesktop: true,
  },
  {
    name: '場域介紹',
    enName: 'Venue',
    href: '/coming-soon',
    isTablet: true,
    isDesktop: true,
  },
  {
    name: '贊助廠商',
    enName: 'Sponsors',
    href: '/sponsors',
    isTablet: false,
    isDesktop: true,
  },
  {
    name: '主辦團隊',
    enName: 'Staff',
    href: '/staff',
    isTablet: false,
    isDesktop: true,
  },
  {
    name: '歷屆回顧',
    enName: 'History',
    href: '/history',
    isTablet: false,
    isDesktop: true,
  },
]
const { isSaleOpen, isFirstLoad, isMenuOpen, setToggleMenu } = useGlobalState()

const lenis = useLenis()

function onToggleMenu() {
  setToggleMenu(!isMenuOpen.value)

  if (isMenuOpen.value) {
    lenis.stop()
  }
  else {
    lenis.start()
  }
}

function closeMenu() {
  setToggleMenu(false)
  lenis.start()
}

onUnmounted(() => {
  lenis.start()
})
</script>

<template>
  <header
    class="fixed top-0 z-50 w-full border-b border-b-webconf-gray bg-black transition-all ease-out lg:bg-black"
    :class="{
      'bg-webconf-blue': isMenuOpen,
      '-translate-y-4 opacity-0 duration-500': !isFirstLoad,
      'translate-y-0 opacity-100 duration-2500': isFirstLoad,
    }"
  >
    <div
      class="container flex items-center justify-between px-5 sm:px-8 lg:px-20"
    >
      <!-- logo -->
      <NuxtLink
        v-cursor="{ scale: 0.4, duration: 0.5 }"
        to="/"
        aria-label="回到首頁"
        class="group relative inline-block shrink-0"
        @click="closeMenu"
      >
        <!-- default logo -->
        <NuxtImg
          src="/images/home/header/headerLogo.svg"
          alt="2025 WebConf"
          width="191"
          height="28"
          class="h-5 w-[137px] opacity-100 transition-opacity duration-500 sm:h-[28px] sm:w-[191px] lg:group-hover:opacity-0"
        />
        <!-- hover logo -->
        <NuxtImg
          src="/images/home/header/headerLogoHover.svg"
          alt="2025 WebConf"
          width="191"
          height="28"
          class="absolute inset-0 h-5 w-[137px] opacity-0 transition-opacity duration-500 sm:h-[28px] sm:w-[191px] lg:group-hover:opacity-100"
        />
      </NuxtLink>

      <!-- 導覽列 -->
      <div
        class="flex shrink-0 items-center py-2 text-btn-16 text-webconf-gray xs:py-3"
      >
        <nav>
          <ul
            class="flex py-[3px] pr-0 sm:pr-3 lg:pr-4"
            :class="{ 'hidden lg:flex': isMenuOpen }"
          >
            <li
              v-for="navItem in NAV_ITEMS"
              :key="navItem.name"
              class="hidden"
              :class="{
                'hidden sm:block lg:block':
                  navItem.isTablet && navItem.isDesktop,
                'hidden sm:hidden lg:block':
                  !navItem.isTablet && navItem.isDesktop,
                'hidden': !navItem.isTablet && !navItem.isDesktop,
              }"
            >
              <NuxtLink
                v-cursor="{ scale: 0.4, duration: 0.5 }"
                class="inline-block px-3 py-1 transition-colors duration-500 lg:hover:text-webconf-blue"
                :aria-label="navItem.name"
                :to="navItem.href"
              >
                {{ navItem.name }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- 是否購票按鈕 -->
        <a
          v-if="!isSaleOpen && !isMenuOpen"
          :href="EXTERNAL_LINKS.CONF_TICKET_URL"
          class="inline-block pr-3 sm:pr-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ShareTag
            size="lg"
            class="transition-colors duration-500 hover:bg-transparent"
          >
            前往購票
          </ShareTag>
        </a>

        <!-- 手機選單按鈕 -->
        <button
          type="button"
          class="block px-0 py-[3px] sm:px-3 sm:py-[4px] lg:hidden"
        >
          <NuxtImg
            src="/images/icon/hamburgerMenu.svg"
            width="24"
            height="24"
            :class="{ hidden: isMenuOpen }"
            @click="onToggleMenu"
          />
          <NuxtImg
            src="/images/icon/close.svg"
            width="24"
            height="24"
            :class="{ hidden: !isMenuOpen }"
            @click="onToggleMenu"
          />
        </button>
      </div>

      <!-- 手機和平板使用選單 -->
      <Transition
        enter-active-class="transition-all duration-500 ease-out"
        leave-active-class="transition-all duration-300 ease-in"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-screen opacity-100"
        leave-from-class="max-h-screen opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <ul
          v-show="isMenuOpen"
          class="mobile-menu absolute left-0 top-[calc(100%+1px)] flex w-dvw flex-col gap-12 overflow-hidden bg-black p-8 pt-10 before:absolute before:left-[38px] before:top-0 before:h-full before:w-[0.5px] before:bg-webconf-gray before:content-[''] sm:pl-[60px] sm:pr-20 sm:pt-20 before:sm:left-[66px] lg:hidden"
        >
          <li
            v-for="navItem in NAV_ITEMS"
            :key="navItem.name"
          >
            <NuxtLink
              v-cursor="{ scale: 0.4, duration: 0.5 }"
              class="flex w-full items-center gap-4 before:block before:size-3 before:shrink-0 before:bg-webconf-gray before:content-[''] sm:gap-8"
              :to="navItem.href"
              :aria-label="navItem.enName"
              @click="closeMenu"
            >
              <div class="flex w-full items-end justify-between">
                <span class="text-h3-40 text-white">{{ navItem.enName }}</span>
                <span class="text-btn-14 text-webconf-gray">{{
                  navItem.name
                }}</span>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </Transition>
    </div>
  </header>
</template>

<style scoped>
.mobile-menu {
  background-image: url("/images/menuBg.webp");
  background-size: auto 215px;
  background-repeat: no-repeat;
  background-position: center bottom;
}

@media (min-width: 480px) {
  .mobile-menu {
    background-size: 100% 320px;
  }
}

@supports (min-height: 100dvh) {
  .mobile-menu {
    min-height: 100dvh;
  }
}
</style>

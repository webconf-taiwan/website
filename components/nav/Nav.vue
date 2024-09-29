<script setup lang="ts">
import { Button } from '@/components/ui/button'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { navLinks } from '~/constants'

const aboutUsDrawer = useTemplateRef('aboutUsDrawer')

function test() {
  console.log(1)
  aboutUsDrawer?.value?.open()
}
</script>

<template>
  <!-- 手機版 -->
  <nav class="fixed right-0 top-0 z-40 bg-black lg:hidden">
    <button
      class="relative flex h-12 w-10 items-center pl-1"
      @click="test"
    >
      <!-- 裝飾用多邊形 -->
      <div
        class="absolute left-0 top-0 h-full w-3 -translate-x-3 bg-black"
        style="clip-path: polygon(100% 0%, 100% 50%, 100% 100%, 100% 100%, 0 65%, 0 0);"
      ></div>

      <Icon
        name="heroicons:bars-3-16-solid"
        class="size-6 text-primary-green"
      />

      <Teleport to="body">
        <NavHamburger ref="aboutUsDrawer">
          <template #header>
            <HomeSectionTitle>
              <template #title>
                About
              </template>
              <template #subTitle>
                關於
              </template>
            </HomeSectionTitle>
          </template>
          <template #content>
            <div class="space-y-5 text-justify leading-7 tracking-wide">
              <p>
                WebConf Taiwan 是一個聚集網頁技術愛好者和專家的年度盛會，讓大家一起探索網頁技術的演進和未來發展趨勢。過去幾年，網路世界變化迅速，我們將在這次研討會上回顧網頁技術的演變歷程，了解那些改變遊戲規則的關鍵時刻。
              </p>
              <p>
                除了回顧過去，WebConf Taiwan 更專注於未來。我們會討論如何利用人工智慧和機器學習來改善使用者體驗，以及行動優化和響應式設計在現代網頁開發中的重要性。還有最新的業界趨勢分享，幫助企業把握未來發展方向，保持競爭優勢。
              </p>
              <p>
                這將是一個充滿創意和靈感的活動，讓你與來自各地的網頁技術專業人士互動交流，共同探討未來的技術創新和可能性。
              </p>
            </div>
          </template>
        </NavHamburger>
      </Teleport>
    </button>
  </nav>

  <!-- 電腦版 -->
  <nav class="fixed right-0 top-0 z-40">
    <div
      class="relative hidden items-center bg-black px-[30px] lg:flex"
      data-aos="fade-down"
      data-aos-delay="3000"
    >
      <div
        class="absolute left-0 top-0 h-full w-5 translate-x-[-19px] bg-black"
        style="clip-path: polygon(100% 0%, 100% 50%, 100% 100%, 100% 100%, 0 65%, 0 0);"
      ></div>

      <template
        v-for="link in navLinks"
        :key="link.name"
      >
        <router-link
          v-if="link.name !== '歷屆'"
          :to="link.href"
          class="relative px-[14px] py-3 hover:text-primary-green"
        >
          <span class="text-h5">
            {{ link.name }}
          </span>
        </router-link>

        <div v-else>
          <HoverCard
            :close-delay="0"
            :open-delay="0"
          >
            <HoverCardTrigger as-child>
              <Button class="h-full bg-black py-4 hover:bg-black hover:text-primary-green">
                <span class="text-lg">
                  {{ link.name }}
                </span>
              </Button>
            </HoverCardTrigger>

            <HoverCardContent
              class="w-auto rounded-none border-none bg-black p-0 px-6 py-5 text-white"
            >
              <ul class="space-y-6">
                <li>
                  <router-link
                    to="/2013"
                    class="px-3 py-[2px] hover:text-primary-green"
                  >
                    2013
                  </router-link>
                </li>
                <li>
                  <router-link
                    to="/2023"
                    class="px-3 py-[2px] hover:text-primary-green"
                  >
                    2023
                  </router-link>
                </li>
              </ul>
            </HoverCardContent>
          </HoverCard>
        </div>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
import { navLinks } from '~/constants'

const breakpoints = useBreakpoints(breakpointsTailwind)
const isSmallerLg = breakpoints.smaller('lg')

const navDrawer = useTemplateRef('navDrawer')

watch(isSmallerLg, () => {
  navDrawer.value?.close()
})
</script>

<template>
  <!-- 手機版 -->
  <nav class="fixed top-0 right-0 z-40 bg-black lg:hidden">
    <button
      class="relative flex items-center w-10 h-12 pl-1"
      @click="navDrawer?.open()"
    >
      <!-- 裝飾用多邊形 -->
      <div
        class="absolute top-0 left-0 w-3 h-full -translate-x-3 bg-black"
        style="clip-path: polygon(100% 0%, 100% 50%, 100% 100%, 100% 100%, 0 65%, 0 0);"
      ></div>

      <Icon
        name="heroicons:bars-3-16-solid"
        class="size-6 text-primary-green"
      />

      <Teleport to="body">
        <Drawer
          ref="navDrawer"
          slide-direction="slide-down"
          :default-close-btn="false"
        >
          <template #custom>
            <NavDrawerHeader />
            <NavDrawerContent :nav-links="navLinks" />
            <NavDrawerCloseBtn @close="navDrawer?.close" />
          </template>
        </Drawer>
      </Teleport>
    </button>
  </nav>

  <!-- 電腦版 -->
  <nav class="fixed top-0 right-0 z-40">
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
        <NuxtLink
          v-if="link.name !== '歷屆'"
          :to="link.href"
          class="relative px-[14px] py-3 hover:text-primary-green"
        >
          <span class="text-h5">
            {{ link.name }}
          </span>
        </NuxtLink>

        <div v-else>
          <HoverCard
            :close-delay="0"
            :open-delay="0"
          >
            <HoverCardTrigger as-child>
              <Button class="h-full py-4 bg-black hover:bg-black hover:text-primary-green">
                <span class="text-lg">
                  {{ link.name }}
                </span>
              </Button>
            </HoverCardTrigger>

            <HoverCardContent
              class="w-auto p-0 px-6 py-5 text-white bg-black border-none rounded-none"
            >
              <ul class="space-y-6">
                <li>
                  <NuxtLink
                    to="https://2013.webconf.tw/"
                    target="_blank"
                    class="px-3 py-[2px] hover:text-primary-green"
                  >
                    2013
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink
                    to="https://2023.webconf.tw/"
                    target="_blank"
                    class="px-3 py-[2px] hover:text-primary-green"
                  >
                    2023
                  </NuxtLink>
                </li>
              </ul>
            </HoverCardContent>
          </HoverCard>
        </div>
      </template>
    </div>
  </nav>
</template>

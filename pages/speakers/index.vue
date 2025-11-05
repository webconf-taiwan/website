<script setup lang="ts">
import type { AgendaTag } from '~/types'
import { SPEAKERS } from '~/constants/agendas'

useSeoMeta({
  title: '講者陣容',
})

const selectedDate = ref(new Date() <= new Date('2025-12-13') ? '12' : '13')

// 監聽 selectedDate 變化，切換時滾動到頂部
watch(selectedDate, () => {
  const lenis = useLenis()
  if (lenis) {
    lenis.scrollTo(0)
  }
})

const isMenuOpen = ref(false)
const showAside = ref(false)

const selectedTags = ref<AgendaTag[]>([])

// 延遲隱藏 aside 以確保過渡完成
watch(isMenuOpen, (newValue) => {
  if (newValue) {
    showAside.value = true
  }
  else {
    // 等待 leave transition 完成後再隱藏
    setTimeout(() => {
      showAside.value = false
    }, 200)
  }
})
</script>

<template>
  <div>
    <section class="flex-1">
      <div class="agenda-section relative h-80 text-webconf-gray lg:h-400">
        <!-- 浮動方框 -->
        <ShareLayoutBlocks />
        <!-- 桌機使用 -->
        <svg
          class="absolute inset-0 hidden size-full sm:block"
          viewBox="0 0 1440 400"
          preserveAspectRatio="xMidYMid slice"
        >
          <!-- 右側斜線 -->
          <g>
            <!-- 靜態軌道 -->
            <line
              x1="995"
              y1="0"
              x2="1410"
              y2="400"
              stroke="#E6E6E6"
              stroke-width="0.5"
            />
          </g>

          <!-- 左側斜線 -->
          <g>
            <!-- 靜態軌道 -->
            <line
              x1="0"
              y1="55"
              x2="345"
              y2="400"
              stroke="#E6E6E6"
              stroke-width="0.5"
            />
          </g>
        </svg>
        <!-- 平板以下使用 -->
        <svg
          class="absolute inset-0 block size-full sm:hidden"
          viewBox="0 0 360 320"
          preserveAspectRatio="xMidYMid slice"
        >
          <!-- 右側斜線 -->
          <g>
            <!-- 靜態軌道 -->
            <line
              x1="185"
              y1="0"
              x2="525"
              y2="320"
              stroke="#E6E6E6"
              stroke-width="0.5"
            />
          </g>
        </svg>
        <div
          class="absolute left-[50%] top-[45%] flex w-fit -translate-x-1/2 flex-col items-center justify-center gap-6 px-6 sm:top-[38%] lg:top-[50%] lg:w-full lg:flex-row lg:items-end"
        >
          <h1 class="text-h1-96 text-white">
            AGENDA
          </h1>
          <div class="flex w-full flex-col gap-3 lg:w-fit">
            <span
              class="inline-block px-0 text-center text-h4-24 lg:pl-[150px] lg:pr-10"
            >議程頁</span>
            <div class="order-[-1] flex items-center lg:order-1">
              <span class="size-3 bg-white"></span>
              <span class="h-[1px] flex-1 bg-white"></span>
              <span class="size-3 bg-white"></span>
            </div>
          </div>
        </div>
        <div
          v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
          class="absolute bottom-0 left-0 z-30 h-[1px] w-full bg-webconf-gray"
        ></div>
      </div>
    </section>

    <main class="border-b border-webconf-gray text-webconf-gray">
      <section
        class="sticky top-[54.5px] z-20 border-b border-webconf-gray bg-black"
      >
        <div class="flex-center py-[6px] text-h4-24 lg:py-3">
          <!-- 日期篩選 -->
          <AgendaEventDaySwitch v-model="selectedDate" />

          <!-- 議程類型篩選 -->
          <AgendaTagFilterBtn
            :is-menu-open="isMenuOpen"
            size="sm"
            :selected-tags-count="selectedTags.length"
            class="ml-3 lg:hidden"
            @click="isMenuOpen = true"
          />

          <!-- 廳號 -->
          <div
            class="hidden grow text-center text-h4-24 lg:grid lg:grid-cols-3"
          >
            <h3 class="col-span-1">
              M 棟
            </h3>
            <h3 class="col-span-1">
              F 棟
            </h3>
            <h3 class="col-span-1">
              A2 棟
            </h3>
          </div>
        </div>

        <div
          v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
          class="relative z-30"
        ></div>
      </section>

      <!-- 議程列表 -->
      <section class="relative flex">
        <!-- 議程類型篩選清單 -->
        <aside
          :class="{
            'z-10 flex': isMenuOpen || showAside,
            'hidden lg:flex': !isMenuOpen && !showAside,
          }"
          class="sticky top-[106px] h-[calc(100dvh-106px)] w-0 shrink-0 flex-col items-start self-start border-webconf-gray bg-black lg:sticky lg:top-[124px] lg:w-[228px] lg:border-r lg:p-4 2xl:w-[260px] 2xl:pl-12"
        >
          <!-- 篩選按鈕 -->
          <AgendaTagFilterBtn
            :is-menu-open="isMenuOpen"
            size="lg"
            :selected-tags-count="selectedTags.length"
            @click="isMenuOpen = true"
          />

          <!-- 篩選清單 -->
          <AgendaTagFilterMenu
            v-model:is-open="isMenuOpen"
            v-model:selected-tags="selectedTags"
          />

          <!-- 半透明遮罩 -->
          <transition
            enter-active-class="transition-opacity duration-300"
            leave-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div
              v-if="isMenuOpen"
              class="absolute inset-0 h-full w-[100dvw] bg-black/80"
              @click="isMenuOpen = false"
            ></div>
          </transition>
        </aside>

        <div
          v-cursor="{
            scale: 0.5,
            duration: 0.5,
          }"
          class="relative grid w-full grid-cols-1 lg:grid-cols-4 3xl:grid-cols-5"
        >
          <ShareGridCard
            v-for="(speaker, index) in SPEAKERS"
            :key="`${speaker.name}-${index}`"
            :data="speaker"
            :index="index"
            :is-selected="
              speaker.tags?.some((tag) => selectedTags.includes(tag))
                || selectedTags.length === 0
            "
            link="/speakers"
            :show-initial-scale-square="false"
          >
            <div class="p-5 lg:p-9">
              <NuxtImg
                src="/images/speakers/carousel-01_happy.webp"
                :alt="speaker.name"
                width="220"
                height="314"
                class="aspect-speaker-img-full size-full object-cover"
              />
            </div>
          </ShareGridCard>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.agenda-section {
  background-image: url("/images/sponsorsBanner.webp");
  background-repeat: no-repeat;
  background-position: center top;
  background-size: auto 400px;
}

@media (min-width: 640px) {
  .agenda-section {
    background-position: center;
    background-size: cover;
  }
}

/* 議程淡入淡出效果 */
.agenda-fade-enter-active,
.agenda-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.agenda-fade-enter-from,
.agenda-fade-leave-to {
  opacity: 0;
}

.agenda-fade-enter-to,
.agenda-fade-leave-from {
  opacity: 1;
}

.agenda-fade-move {
  transition: opacity 0.3s ease-in-out;
}
</style>

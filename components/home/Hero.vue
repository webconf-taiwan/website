<script setup lang="ts">
// 控制大螢幕線條顯示
const showLargeScreenLine = ref(false)

onMounted(() => {
  // 檢測螢幕尺寸
  const checkScreenSize = () => {
    showLargeScreenLine.value = window.innerWidth >= 1536 // 2xl 斷點
  }

  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)

  onUnmounted(() => {
    window.removeEventListener('resize', checkScreenSize)
  })
})
</script>

<template>
  <section class="hero-section relative min-h-svh w-full lg:h-screen">
    <div class="absolute inset-0">
      <!-- 貝茲曲線特效 -->
      <!-- <HomeHeroCurve /> -->
      <svg
        class="pointer-events-none absolute inset-0 hidden size-full"
        viewBox="0 0 1440 720"
        preserveAspectRatio="xMidYMid slice"
      >
        <!-- 右上斜線 - 從右上角延伸到中間 -->
        <line
          v-arrow="{
            speed1: '6s',
            speed2: '4s',
            delay: '0s',
            color: 'white',
            count: 2,
          }"
          x1="950"
          y1="0"
          x2="1440"
          y2="490"
          stroke="#666"
          stroke-width="1"
        />

        <!-- 左上斜線（大螢幕顯示） -->
        <g v-if="showLargeScreenLine">
          <line
            v-arrow="{ speed1: '8s', color: 'white', direction: -1 }"
            x1="216"
            y1="0"
            x2="500"
            y2="284"
            stroke="#666"
            stroke-width="1"
          />
        </g>

        <!-- 左側斜線 - 延伸到底部邊界 -->
        <line
          v-arrow="{
            speed1: '8s',
            speed2: '6s',
            delay: '0s',
            color: 'white',
            count: 2,
          }"
          x1="0"
          y1="122"
          x2="598"
          y2="720"
          stroke="#666"
          stroke-width="1"
        />

        <!-- 水平線 - 橫跨整個寬度 -->
        <line
          v-arrow="{ speed1: '8s', color: 'white' }"
          x1="0"
          y1="479"
          x2="1440"
          y2="479"
          stroke="#666"
          stroke-width="1"
        />
      </svg>
      <!-- 標題區域 -->
      <div
        class="absolute right-0 top-[63%] w-full -translate-y-1/2 text-right lg:right-[4%] lg:w-auto"
      >
        <div
          class="flex flex-col items-center gap-4 px-5 sm:items-end sm:gap-[52px] sm:px-[52px]"
        >
          <NuxtImg
            src="/images/heroLogo.webp"
            alt="2025 WebConf Logo"
            format="webp"
            width="570"
            height="215"
            class="mr-0 sm:mr-[86px] sm:w-[570px]"
          />
          <NuxtImg
            src="/images/heroTitle.webp"
            alt="Connecting the Web to a Sustainable Future"
            format="webp"
            width="527"
            height="27"
            class="pb-8 sm:w-[527px] sm:pb-0"
          />
          <ShareLinkButton
            to="/"
            class="text-center"
          >
            前往購票
          </ShareLinkButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  background: url("/images/heroBg.svg");
  background-repeat: no-repeat;
  background-position: 68% center;
  background-size: cover;
}
</style>

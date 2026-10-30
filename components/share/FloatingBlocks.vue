<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const { gsap } = useGsap()
const route = useRoute()
const settledPath = useSettledRoutePath()
const hiddenPaths = ['/agenda', '/sponsors', '/history']

function isHiddenPath(path: string) {
  return hiddenPaths.some(hiddenPath => path.startsWith(hiddenPath))
}

// 要去的頁面不顯示方塊：跟著舊頁一起淡出；
// 要去的頁面會顯示：等舊頁離場、跟新頁一起淡入，不會比新頁先冒出來
const isVisible = computed(
  () => !isHiddenPath(route.path) && !isHiddenPath(settledPath.value),
)

// 淡入 0.5 秒、淡出 0.4 秒，跟換頁的進場與離場同步
const fadeStyle = computed(() => ({
  transitionDuration: isVisible.value ? '500ms' : '400ms',
}))

const topGroupRef = ref<HTMLElement | null>(null)
const bottomGroupRef = ref<HTMLElement | null>(null)

onMounted(() => {
  // 一開始就在不顯示方塊的頁面時也要啟動，之後換到會顯示的頁面才會浮動
  const els = [topGroupRef.value, bottomGroupRef.value].flatMap(group =>
    group ? [...group.querySelectorAll<HTMLElement>('.float-blocks')] : [],
  )

  els.forEach((el) => {
    gsap.to(el, {
      x: () => gsap.utils.random(-10, 10),
      y: () => gsap.utils.random(-10, 10),
      duration: gsap.utils.random(1, 1.5),
      ease: 'none',
      repeat: -1,
      repeatRefresh: true,
    })
  })
})
</script>

<template>
  <!--
    方塊分成右上與左下兩組，各自貼齊視窗的角落。
    原本共用一個滿版容器，手機捲動時網址列伸縮會讓容器高度重算，左下的方塊跟著瞬間跳動；
    改用 bottom-0 直接貼齊視窗底部，瀏覽器會讓它順著網址列一起移動
  -->
  <div
    ref="topGroupRef"
    v-bind="$attrs"
    class="pointer-events-none fixed right-0 top-0 touch-none select-none transition-[opacity,visibility]"
    :class="isVisible ? 'visible opacity-100' : 'invisible opacity-0'"
    :style="fadeStyle"
  >
    <div
      class="float-blocks absolute right-[19.33px] top-[79.65px] block size-[18.29px] bg-[#2F2ADB] md:hidden md:size-[22.05px]"
    ></div>
    <div
      class="float-blocks absolute right-[49.95px] top-[32.31px] block size-[18.29px] bg-[#2F2ADB] md:hidden md:size-[22.05px] lg:right-[103.15px] lg:top-[46px] lg:block"
    ></div>
    <div
      class="float-blocks absolute right-[49.89px] top-[50.03px] block size-[18.29px] bg-webconf-gray md:hidden md:size-[22.05px] lg:right-[29.05px] lg:top-[76.01px] lg:block"
    ></div>
    <div
      class="float-blocks absolute right-[0.05px] top-[87px] hidden size-[18.29px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-[6px] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:size-[22.05px] md:before:size-2 lg:block"
    ></div>
  </div>
  <div
    ref="bottomGroupRef"
    v-bind="$attrs"
    class="pointer-events-none fixed bottom-0 left-0 touch-none select-none transition-[opacity,visibility]"
    :class="isVisible ? 'visible opacity-100' : 'invisible opacity-0'"
    :style="fadeStyle"
  >
    <div
      class="float-blocks absolute bottom-0 left-0 size-[18.29px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-[6px] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:bottom-[10.05px] md:left-[10px] md:size-[22.05px] md:before:size-2"
    ></div>
    <div
      class="float-blocks absolute bottom-[36.57px] left-[28.4px] size-[18.29px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-[6px] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:bottom-[54.17px] md:left-[54.11px] md:size-[22.05px] md:before:size-2"
    ></div>
    <div
      class="float-blocks absolute bottom-0 left-[46.69px] size-[18.29px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-[6px] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:bottom-[12.06px] md:left-[70.16px] md:size-[22.05px] md:before:size-2"
    ></div>
    <div
      class="float-blocks absolute bottom-[107.78px] left-[9.14px] size-[18.29px] bg-[#2F2ADB] md:bottom-[41.11px] md:left-[76.16px] md:size-[22.05px]"
    ></div>
    <div
      class="float-blocks absolute bottom-[18.29px] left-[46.69px] size-[18.29px] bg-[#2F2ADB] md:bottom-[15.06px] md:left-[120.27px] md:size-[22.05px]"
    ></div>
    <div
      class="float-blocks absolute bottom-[11.06px] left-[182.44px] hidden size-[18.29px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-[6px] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:block md:size-[22.05px] md:before:size-2"
    ></div>
    <div
      class="float-blocks absolute bottom-[26.11px] left-[393.97px] hidden size-[18.29px] bg-[#909090] before:absolute before:inset-1/2 before:block before:size-[6px] before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-[''] md:block md:size-[22.05px] md:before:size-2"
    ></div>
    <div
      class="float-blocks absolute bottom-[49.48px] left-[67.83px] block size-[18.29px] bg-webconf-gray md:hidden"
    ></div>
  </div>
</template>

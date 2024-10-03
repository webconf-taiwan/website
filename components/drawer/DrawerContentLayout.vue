<script setup lang="ts">
const scrollableContent = ref<HTMLElement | null>(null)
const { arrivedState } = useScroll(scrollableContent)
</script>

<template>
  <!-- Drawer header -->
  <div class="mb-8 space-y-2 px-5 lg:px-0">
    <NuxtImg
      src="/drawer/drawer-top-decorate-lg.svg"
      class="hidden w-full sm:block"
    />
    <NuxtImg
      src="/drawer/drawer-top-decorate.svg"
      class="block w-full sm:hidden"
    />
    <slot name="header"></slot>
  </div>

  <!-- Scrollable content area -->
  <div
    class="drawer-content relative flex-1 py-[1px] lg:overflow-y-auto"
    data-lenis-prevent
  >
    <!-- Scrollable content top blur effect -->
    <div
      class="pointer-events-none absolute inset-x-0 top-[-1px] z-10 h-10 bg-gradient-to-b from-black to-transparent transition-opacity duration-300 lg:top-0"
      :class="[arrivedState.top ? 'opacity-0' : 'opacity-100']"
    ></div>

    <div
      ref="scrollableContent"
      class="drawer-content relative mx-2 flex h-[clamp(150px,100%,calc(100dvh-208px))] flex-col overflow-y-auto px-3 lg:mx-0 lg:h-full lg:px-6"
      data-lenis-prevent
    >
      <slot name="content"></slot>

      <div class="mt-10 block space-y-2 lg:hidden">
        <div class="flex h-3 justify-center space-x-1.5">
          <span
            v-for="(_, index) in 6"
            :key="index"
            class="h-full w-[2px] bg-primary-green"
          ></span>
        </div>
        <div class="w-full translate-y-[-1px] border-t border-primary-green"></div>
      </div>
    </div>

    <!-- (Desktop) Scrollable content bottom blur effect -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 hidden h-10 bg-gradient-to-t from-black to-transparent transition-opacity duration-300 lg:block"
      :class="[arrivedState.bottom ? 'opacity-0' : 'opacity-100']"
    ></div>

    <!-- (Mobile) Scrollable content bottom blur effect -->
    <div
      class="pointer-events-none fixed inset-x-0 bottom-4 z-[1040] block h-10 bg-gradient-to-t from-black to-transparent transition-opacity duration-300 lg:hidden"
      :class="[arrivedState.bottom ? 'opacity-0' : 'opacity-100']"
    ></div>
  </div>

  <!-- (Desktop) Drawer footer -->
  <div class="hidden space-y-2 pt-2 lg:block">
    <div class="flex h-3 justify-center space-x-1.5">
      <span
        v-for="(_, index) in 6"
        :key="index"
        class="h-full w-[2px] bg-primary-green"
      ></span>
    </div>

    <div class="w-full border-t border-primary-green"></div>
  </div>
</template>

<style scoped>
/* 自定義滾動條樣式 */
.drawer-content {
  scrollbar-width: thin;
  scrollbar-color: var(--primary-green) black;
}

.drawer-content::-webkit-scrollbar {
  width: 4px;
}

.drawer-content::-webkit-scrollbar-thumb {
  border-radius: 6px;
  background-color: var(--primary-green);
}
</style>

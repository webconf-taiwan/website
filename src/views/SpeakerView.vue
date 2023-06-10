<template>
  <div class="py-16">
    <div
      class="hidden md:block fixed transform translate-y-1/2 bottom-1/2 left-6 z-30"
      v-if="currentSpiderNum !== 1 && currentSpiderNum !== 6"
    >
      <div class="flex flex-col justify-center items-center">
        <a href="https://www.facebook.com/WebConfTaiwan" target="_blank">
          <div class="fbIcon w-6 h-6 bg-cover"></div>
        </a>
        <div class="m-2 w-0.5 h-10 bg-custom-teal-500"></div>
        <p class="writing-vertical text-custom-teal-500 text-sm font-rajdhani">
          Webconf 2023 All Rights Reserved.
        </p>
      </div>
    </div>

    <div class="logoTxt hidden md:block w-[250px] h-[125px] bg-cover fixed left-0 top-2"></div>
    <div class="flex flex-col items-center">
      <div>
        <div class="titleDecoration w-20 h-6 ml-auto"></div>
        <div class="text-center bg-custom-gray-800 border border-custom-teal-500 py-2 px-5 mt-1">
          <h2 class="text-custom-teal-500 font-medium text-3xl whitespace-nowrap md:text-5xl">
            講者陣容
          </h2>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-10 mx-10">
      <div>元素 1</div>
      <div>元素 2</div>
    </div>
  </div>
</template>

<style scoped>
.titleDecoration {
  background: url('@/assets/images/title_display.svg') no-repeat;
}

.fbIcon {
  background-image: url('@/assets/images/icon/ic_fb_l.svg');
}

.logoTxt {
  background-image: url('@/assets/images/logo_windows_txt.png');
}

.writing-vertical {
  writing-mode: vertical-rl;
}
</style>

<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePageInfoStore } from '@/stores/pageInfo';

const route = useRoute(); // 取得路由資訊

const pageInfoStore = usePageInfoStore();
const { setCurrentPageName } = pageInfoStore;

onMounted(() => {
  // 設定當前路由名稱
  setCurrentPageName(route.name);
});
</script>

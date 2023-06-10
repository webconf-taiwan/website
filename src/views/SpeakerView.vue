<template>
  <div class="py-16 relative">
    <div
      class="hidden md:block fixed transform translate-y-1/2 bottom-1/2 left-6 z-30"
      v-if="!fbDecorativeLink"
    >
      <StylingFBLink></StylingFBLink>
    </div>

    <div
      class="fixed transform translate-y-1/2 bottom-32 right-2 sm:right-1 md:right-[65px] lg:right-[60px] 2xl:right-32 z-10"
    >
      <MoveToTop></MoveToTop>
    </div>

    <div class="logoTxt hidden md:block w-[250px] h-[125px] bg-cover fixed left-0 top-2"></div>
    <div class="flex flex-col items-center mb-20">
      <StylingTitle>
        <template #default>
          <span>講者陣容</span>
        </template>
      </StylingTitle>
    </div>

    <div class="flex flex-col items-center">
      <ul
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[60px] xl:gap-10 2xl:gap-[60px] mx-10 lg:ml-6 lg:mr-10 2xl:mx-10"
      >
        <li
          v-for="item in speakers.speakerPage"
          :key="item.id"
          class="w-[245px] xs:w-[300px] sm:w-[245px]"
        >
          <a href="#" @click.prevent="">
            <div>
              <div class="py-2 border border-custom-teal-500 bg-custom-gray-800 flex">
                <div class="w-5 border-t border-b border-r border-custom-teal-700 my-2 py-1">
                  <div class="h-6px border-t border-b border-custom-teal-700"></div>
                </div>
                <p
                  class="font-rajdhani text-custom-pink-700 font-medium mx-3 text-2xl"
                  :class="{ 'font-rajdhani': item.mainIsEn }"
                >
                  {{ item.mainName }}
                  <span
                    class="text-lg font-medium"
                    :class="{ 'font-rajdhani': item.secondaryIsEn }"
                    v-if="item.secondaryName"
                    >({{ item.secondaryName }})</span
                  >
                </p>
                <div class="border-t border-b border-l border-custom-teal-700 my-2 py-1 flex-grow">
                  <div class="h-6px border-t border-b border-custom-teal-700"></div>
                </div>
              </div>
              <div class="p-3 bg-custom-gray-800 border-l border-r border-b border-custom-teal-500">
                <img :src="item.speaker" alt="speaker" />
              </div>
            </div>
          </a>
        </li>
      </ul>
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
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { usePageInfoStore } from '@/stores/pageInfo';
import StylingTitle from '@/components/StylingTitle.vue';
import StylingFBLink from '@/components/StylingFBLink.vue';
import MoveToTop from '@/components/moveToTop.vue';
import { speakers } from '@/content/speakers';

const route = useRoute(); // 取得路由資訊

const pageInfoStore = usePageInfoStore();
const { setCurrentPageName } = pageInfoStore;

const fbDecorativeLink = ref(false);

const isScrollAtBottom = () => {
  const { scrollTop } = document.documentElement;
  const clientHeight = document.documentElement.clientHeight - 446;
  const isBottom = scrollTop > clientHeight;

  if (isBottom) {
    fbDecorativeLink.value = true;
    return;
  }
  fbDecorativeLink.value = false;
};

onMounted(() => {
  // 設定當前路由名稱
  setCurrentPageName(route.name);
  window.addEventListener('scroll', isScrollAtBottom);
});
</script>

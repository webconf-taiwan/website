<template>
  <div class="relative py-20 md:py-16 px-5 md:h-[calc(100vh-56px)] overflow-y-auto">
    <a href="#"
      ><div class="logoTxt hidden md:block w-[250px] h-[125px] bg-cover fixed left-0 top-2"></div
    ></a>
    <div class="flex flex-col items-center mb-8">
      <StylingTitle>
        <template #default>
          <span>贊助夥伴</span>
        </template>
      </StylingTitle>
    </div>
    <p class="text-white text-center max-w-[380px] mx-auto mb-12 md:mb-16">
      我們非常感謝以下的企業或個人贊助，讓 WebConf Taiwan 2023 可以有更多的資源來籌劃整個活動！
    </p>
    <div class="flex justify-center items-center first-letter flex-col md:flex-row">
      <img src="@/assets/images/logo_all_m.png" alt="" class="w-[250px] md:w-[350px] md:mr-3" />
      <div>
        <p
          class="text-center md:text-left font-semibold text-white text-2xl md:text-5xl md:leading-normal mb-6 md:mb-12"
        >
          即刻加入 <br />
          成為<span class="text-custom-pink-700">贊助夥伴</span>
        </p>
        <a href="mailto:hi@webconf.tw?subject=WebConf 贊助廠商諮詢" class="mailto-button">
          前往諮詢
        </a>
      </div>
    </div>

    <div class="flex justify-center mt-8">
      <ul>
        <li class="text-white w-[332px]">
          <h2
            class="border-t border-l border-r border-custom-teal-500 bg-custom-gray-800 text-custom-teal-500 text-[28px] md:text-32 leading-normal font-medium py-4 px-7 inline-block"
          >
            鑽石級贊助商
          </h2>
          <div class="border border-custom-teal-500 bg-custom-gray-800 p-2">
            <div class="flex items-center py-1 border border-custom-teal-500 bg-custom-gray-800">
              <div class="w-8 mt-1 mb-1 mr-2 border-t border-b border-r border-custom-teal-700">
                <div class="my-1 border-t border-b border-custom-teal-700 h-6px"></div>
              </div>
              <h3 class="text-2xl leading-normal text-custom-pink-700 whitespace-nowrap">
                新加坡商鈦坦科技
              </h3>
              <div
                class="flex-grow mt-1 mb-1 ml-2 border-t border-b border-l border-custom-teal-700"
              >
                <div class="my-1 border-t border-b border-custom-teal-700 h-6px"></div>
              </div>
            </div>
            <div class="border-r border-l border-b border-custom-teal-500 p-3">
              <img src="" alt="" />
              <div class="flex items-center">
                <p class="text-custom-teal-500 text-xl leading-6 font-medium">贊助商簡介</p>
                <div class="iconArrowUp w-5 h-5 ml-2"></div>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { usePageInfoStore } from "@/stores/pageInfo";
import StylingTitle from "@/components/StylingTitle.vue";

const route = useRoute();

const pageInfoStore = usePageInfoStore();
const { setCurrentPageName } = pageInfoStore;

onMounted(() => {
  setCurrentPageName(route.name);
});
</script>

<style scoped>
.logoTxt {
  background-image: url("@/assets/images/logo_windows_txt.png");
}

.mailto-button {
  @apply inline-block font-semibold leading-none py-4 px-9 text-lg;
  @apply bg-custom-teal-500 text-black;
  @apply border-transparent border;
}

.mailto-button:hover {
  @apply bg-custom-teal-700 text-custom-teal-500 border-custom-teal-500 border;
}

.mailto-button:active {
  @apply bg-custom-teal-500  text-black;
}

.iconArrowUp {
  background-image: url("@/assets/images/icon/ic_arrow_up_s.svg");
}

.iconArrowDown {
  background-image: url("@/assets/images/icon/ic_arrow_down_s.svg");
}
</style>

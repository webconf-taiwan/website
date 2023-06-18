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
        <a
          href="mailto:hi@webconf.tw?subject=WebConf 贊助廠商諮詢"
          class="inline-block font-semibold leading-none bg-custom-teal-500 py-4 px-9 text-lg"
        >
          前往諮詢
        </a>
      </div>
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
</style>

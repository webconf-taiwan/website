<script setup>
import { storeToRefs } from "pinia";
import { usePageInfoStore } from "@/stores/pageInfo";

const pageInfoStore = usePageInfoStore();
const { currentPageName } = storeToRefs(pageInfoStore);
</script>

<template>
  <footer v-if="currentPageName !== '2013WebConf'" class="relative z-10 p-6 bg-custom-gray-800 md:px-8 md:py-3">
    <div class="flex flex-col items-center md:flex-row md:justify-between">
      <ul class="flex">
        <li>
          <!-- border-r -->
          <a
            href="mailto:hi@webconf.tw"
            class="flex items-center px-4 py-1 text-sm font-normal text-custom-teal-500 border-custom-teal-700 md:border-r-0 whitespace-nowrap hover:text-custom-teal-700"
            ><div class="w-4 h-4 mr-1 bg-cover mailIcon"></div>
            <p>hi@webconf.tw</p></a
          >
        </li>
      </ul>
      <div class="flex items-center mt-2 md:mb-0">
        <a href="https://www.facebook.com/WebConfTaiwan" target="_blank">
          <div class="w-6 h-6 bg-cover fbIcon"></div>
        </a>
        <div class="m-2 w-10 h-0.5 bg-custom-teal-500"></div>
        <p class="text-sm font-normal text-custom-teal-500">WebConf Taiwan 2023 All Rights Reserved.</p>
      </div>
      <ul class="md:flex mr-14"></ul>
    </div>
  </footer>
</template>

<style scoped>
.fbIcon {
  background-image: url("@/assets/images/icon/ic_fb_l.svg");
}
.mailIcon {
  background-image: url("@/assets/images/icon/ic_mail_s.svg");
}
</style>

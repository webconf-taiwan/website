<template>
  <div class="relative py-20 md:py-16 min-h-screen">
    <div class="fixed z-30 hidden md:block bottom-6 left-6">
      <StylingFBLink></StylingFBLink>
    </div>

    <div class="fixed bottom-32 md:bottom-[57px] right-2 sm:right-1 md:right-[72px] z-10">
      <MoveToTop></MoveToTop>
    </div>
    <a href="#"
      ><div class="logoTxt hidden md:block w-[250px] h-[125px] bg-cover fixed left-0 top-2"></div
    ></a>

    <div class="flex flex-col items-center mb-16">
      <StylingTitle>
        <template #default>
          <span>主辦團隊</span>
        </template>
      </StylingTitle>
    </div>

    <div class="flex flex-col items-center relative">
      <ul
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[60px] xl:gap-10 2xl:gap-[60px] mx-10 lg:ml-6 lg:mr-10 2xl:mx-10"
      >
        <li
          v-for="staff in staffs"
          :key="staff.name"
          class="w-[245px] xs:w-[300px] sm:w-[245px] hover-parent"
        >
          <div href="#" class="relative">
            <div class="flex py-2 border border-custom-teal-500 bg-custom-gray-800">
              <div class="w-5 py-1 my-2 border-t border-b border-r border-custom-teal-700">
                <div class="border-t border-b h-6px border-custom-teal-700"></div>
              </div>
              <p class="mx-3 text-2xl font-medium text-custom-pink-700">
                {{ staff.name }}
              </p>
              <div class="flex-grow py-1 my-2 border-t border-b border-l border-custom-teal-700">
                <div class="border-t border-b h-6px border-custom-teal-700"></div>
              </div>
            </div>
            <div
              class="w-[245px] xs:w-[300px] sm:w-[245px] h-[245px] xs:h-[300px] sm:h-[245px] p-3 border-b border-l border-r bg-custom-gray-800 border-custom-teal-500"
            >
              <div class="overflow-hidden relative">
                <img :src="staff.img" alt="speaker avatar" class="object-cover" />
                <div
                  class="hover-mask absolute top-0 inset-x-0 w-full h-full bg-custom-teal-700 opacity-60"
                ></div>
              </div>
            </div>
            <ul
              v-if="staff.links.length"
              class="absolute right-[-8px] bottom-[-8px] border border-custom-teal-500 bg-custom-gray-800"
            >
              <li
                v-for="link in staff.links"
                :key="link.url"
                class="p-1 transition-all duration-300 hover:bg-custom-teal-700"
              >
                <a :href="link.url" target="_blank" class="w-6 h-6 block" :class="link.icon"></a>
              </li>
            </ul>
          </div>
          <ul class="flex flex-wrap mt-3">
            <li
              v-for="item in staff.tags"
              :key="item"
              class="border border-custom-teal-700 rounded-md bg-custom-gray-800 text-custom-teal-500 py-1 px-2 mr-[10px] mb-[10px]"
            >
              {{ item }}
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.logoTxt {
  background-image: url("@/assets/images/logo_windows_txt.png");
}

.hover-mask {
  background-color: transparent;
  transition: background-color 0.3s ease;
}

/* .hover-parent:hover .hover-mask {
  background-color: #006a97;
} */

/* .hover-parent:hover img {
  transition: transform 0.3s ease;
  transform: scale(1.1);
} */

.facebook {
  background: url("@/assets/images/linkIcon/facebook.svg");
  background-size: cover;
}

.instagram {
  background: url("@/assets/images/linkIcon/instagram.svg");
  background-size: cover;
}

.twitter {
  background: url("@/assets/images/linkIcon/twitter.svg");
  background-size: cover;
}

/* .medium {
  background: url("@/assets/images/linkIcon/medium.svg");
  background-size: cover;
} */

.web {
  background: url("@/assets/images/linkIcon/web.svg");
  background-size: cover;
}
</style>

<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { usePageInfoStore } from "@/stores/pageInfo";
import StylingTitle from "@/components/StylingTitle.vue";
import StylingFBLink from "@/components/StylingFBLink.vue";
import MoveToTop from "@/components/MoveToTop.vue";

import { staffs } from "@/content/staff";

const route = useRoute();

const pageInfoStore = usePageInfoStore();
const { setCurrentPageName } = pageInfoStore;

onMounted(() => {
  setCurrentPageName(route.name);
});
</script>

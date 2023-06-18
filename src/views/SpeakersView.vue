<template>
  <div class="relative py-20 md:py-16">
    <div
      ref="fbDecorativeLink"
      class="fixed z-30 hidden transition-opacity duration-300 md:block bottom-6 left-6"
    >
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
          <span>講者陣容</span>
        </template>
      </StylingTitle>
    </div>

    <div class="flex flex-col items-center">
      <ul
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[60px] xl:gap-10 2xl:gap-[60px] mx-10 lg:ml-6 lg:mr-10 2xl:mx-10"
      >
        <li
          v-for="speaker in speakers.speakerPage"
          :key="speaker.id"
          class="w-[245px] xs:w-[300px] sm:w-[245px]"
        >
          <a href="#" @click.prevent="">
            <div>
              <div class="flex py-2 border border-custom-teal-500 bg-custom-gray-800">
                <div class="w-5 py-1 my-2 border-t border-b border-r border-custom-teal-700">
                  <div class="border-t border-b h-6px border-custom-teal-700"></div>
                </div>
                <p class="mx-3 text-2xl font-medium text-custom-pink-700">
                  {{ speaker.displayName }}
                  <span class="text-lg font-medium" v-if="speaker.altName"
                    >({{ speaker.altName }})</span
                  >
                </p>
                <div class="flex-grow py-1 my-2 border-t border-b border-l border-custom-teal-700">
                  <div class="border-t border-b h-6px border-custom-teal-700"></div>
                </div>
              </div>
              <div class="p-3 border-b border-l border-r bg-custom-gray-800 border-custom-teal-500">
                <img :src="speaker.avatar" alt="speaker avatar" />
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
  background: url("@/assets/images/title_display.svg") no-repeat;
}

.fbIcon {
  background-image: url("@/assets/images/icon/ic_fb_l.svg");
}

.logoTxt {
  background-image: url("@/assets/images/logo_windows_txt.png");
}

.writing-vertical {
  writing-mode: vertical-rl;
}
</style>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { usePageInfoStore } from "@/stores/pageInfo";
import StylingTitle from "@/components/StylingTitle.vue";
import StylingFBLink from "@/components/StylingFBLink.vue";
import MoveToTop from "@/components/moveToTop.vue";
import { speakers } from "@/content/speakers";

const route = useRoute();

const pageInfoStore = usePageInfoStore();
const { setCurrentPageName } = pageInfoStore;

const fbDecorativeLink = ref();

const scrollHandler = () => {
  const { scrollTop } = document.documentElement;
  const clientHeight = document.documentElement.clientHeight - 470;
  const isBottom = scrollTop > clientHeight;

  fbDecorativeLink.value.style.opacity = isBottom ? 0 : 1;
};

onMounted(() => {
  setCurrentPageName(route.name);
  window.addEventListener("scroll", scrollHandler);
});
</script>

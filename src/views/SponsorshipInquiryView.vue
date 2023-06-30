<template>
  <div>
    <div class="relative py-20 md:py-16 px-5 md:h-[calc(100vh-56px)]">
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
    </div>
    <div class="flex justify-center relative">
      <ul>
        <li
          v-for="level in sponsors"
          :key="level.En_name"
          class="text-white w-[332px] md:w-[600px] lg:w-[900px] xl:w-[1150px] 2xl:w-[1200px] mb-12"
        >
          <h2
            class="border-t border-l border-r border-custom-teal-500 bg-custom-gray-800 text-custom-teal-500 text-[28px] md:text-32 leading-normal font-medium py-4 px-7 inline-block"
          >
            {{ level.Zh_name }}
          </h2>
          <ul>
            <li class="border border-custom-teal-500 bg-custom-gray-800 pt-2 pl-2 pr-2">
              <div v-for="sponsors in level.sponsors" :key="sponsors.id" class="mb-2">
                <div
                  class="flex items-center py-1 border border-custom-teal-500 bg-custom-gray-800"
                >
                  <div class="w-8 mt-1 mb-1 mr-2 border-t border-b border-r border-custom-teal-700">
                    <div class="my-1 border-t border-b border-custom-teal-700 h-6px"></div>
                  </div>
                  <h3 class="text-2xl leading-normal text-custom-pink-700 whitespace-nowrap">
                    {{ sponsors.sponsor_name }}
                  </h3>
                  <div
                    class="flex-grow mt-1 mb-1 ml-2 border-t border-b border-l border-custom-teal-700"
                  >
                    <div class="my-1 border-t border-b border-custom-teal-700 h-6px"></div>
                  </div>
                </div>
                <div class="border-r border-l border-b border-custom-teal-500 p-3 md:flex">
                  <div
                    class="border border-custom-teal-500 mb-2 w-[291px] h-[233px] md:w-[247px] md:h-[198px] md:flex-shrink-0"
                    :class="sponsors.image"
                  ></div>
                  <div class="flex-grow md:ml-2">
                    <a
                      href="#"
                      @click.prevent="showSponsorIntroduction(sponsors.id)"
                      class="flex items-center p-3 border-b-2 border-custom-teal-700 md:cursor-auto"
                    >
                      <p class="text-custom-teal-500 text-xl leading-6 font-medium">贊助商簡介</p>
                      <div
                        :data-arrow="sponsors.id"
                        class="iconArrowDown w-5 h-5 ml-2 md:hidden"
                      ></div>
                    </a>
                    <div :data-introduction="sponsors.id" class="overflow-hidden h-[0px] md:h-auto">
                      <div class="pt-5 pr-3 pl-3">
                        <p
                          v-for="(Introduction, index) in sponsors.Introduction"
                          :key="index"
                          class="text-white text-base leading-6 mb-3"
                        >
                          {{ Introduction }}
                        </p>
                      </div>
                      <ul class="flex mb-4">
                        <li v-for="link in sponsors.link" :key="link.url" class="ml-2">
                          <a
                            :href="link.url"
                            target="_blank"
                            class="w-10 h-10 block"
                            :class="link.icon"
                          >
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="fixed z-30 hidden md:block bottom-6 left-6">
      <StylingFBLink></StylingFBLink>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { usePageInfoStore } from "@/stores/pageInfo";
import StylingTitle from "@/components/StylingTitle.vue";
import { sponsors } from "@/content/sponsors";
import StylingFBLink from "@/components/StylingFBLink.vue";

const route = useRoute();

const pageInfoStore = usePageInfoStore();
const { setCurrentPageName } = pageInfoStore;

const showSponsorIntroduction = (id) => {
  const viewportWidth = window.innerWidth;
  if (viewportWidth >= 768) return;
  const introductionDom = document.querySelector(`[data-introduction="${id}"]`);
  const arrowDom = document.querySelector(`[data-arrow="${id}"]`);
  if (arrowDom.classList.contains("iconArrowUp")) {
    arrowDom.classList.remove("iconArrowUp");
    introductionDom.classList.remove("h-auto");
    arrowDom.classList.add("iconArrowDown");
  } else {
    arrowDom.classList.add("iconArrowUp");
    introductionDom.classList.add("h-auto");
    arrowDom.classList.remove("iconArrowDown");
  }
};

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

.sponsorsPicCollage {
  background: url("@/assets/images/sponsors/picCollage.svg");
  background-size: cover;
}

.sponsorsKdanmobile {
  background: url("@/assets/images/sponsors/kdanmobile.svg");
  background-size: cover;
}

.sponsorsTrafficInfo {
  background: url("@/assets/images/sponsors/titansoft.svg");
  background-size: cover;
}

.sponsorsHexschool {
  background: url("@/assets/images/sponsors/hexschool.svg");
  background-size: cover;
}

.sponsors5xruby {
  background: url("@/assets/images/sponsors/5xruby.svg");
  background-size: cover;
}

.facebook {
  background: url("@/assets/images/linkIcon/facebook.svg");
  background-size: cover;
}

.instagram {
  background: url("@/assets/images/linkIcon/instagram.svg");
  background-size: cover;
}

.linkedin {
  background: url("@/assets/images/linkIcon/linkedin.svg");
  background-size: cover;
}

.medium {
  background: url("@/assets/images/linkIcon/medium.svg");
  background-size: cover;
}

.twitter {
  background: url("@/assets/images/linkIcon/twitter.svg");
  background-size: cover;
}

.web {
  background: url("@/assets/images/linkIcon/web.svg");
  background-size: cover;
}

.youtube {
  background: url("@/assets/images/linkIcon/youtube.svg");
  background-size: cover;
}
</style>

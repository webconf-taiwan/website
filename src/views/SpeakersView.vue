<!-- eslint-disable vue/no-use-v-if-with-v-for -->
<template>
  <div class="relative py-20 md:py-16 min-h-screen">
    <div class="fixed z-30 hidden md:block bottom-6 left-6">
      <StylingFBLink></StylingFBLink>
    </div>

    <div class="fixed bottom-[180px] md:hidden right-2 sm:right-1 z-10">
      <OpenFilter></OpenFilter>
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

    <SpecialFilter class="mb-8"></SpecialFilter>

    <div class="flex flex-col items-center">
      <ul
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[60px] xl:gap-10 2xl:gap-[60px] mx-10 lg:ml-6 lg:mr-10 2xl:mx-10"
      >
        <li
          v-for="speaker in speakerInfo.filter((item) => item.id !== 'dual')"
          :key="speaker.id"
          class="w-[245px] xs:w-[300px] sm:w-[245px] hover-parent"
          :class="{ hidden: !isShowSpeaker(speaker.categoryTags) }"
        >
          <a href="#" @click.prevent="handleOpenSpeakerModal" :data-speakerId="speaker.id">
            <div class="flex py-2 border border-custom-teal-500 bg-custom-gray-800">
              <div class="w-5 py-1 my-2 border-t border-b border-r border-custom-teal-700">
                <div class="border-t border-b h-6px border-custom-teal-700"></div>
              </div>
              <p class="mx-3 text-2xl font-medium text-custom-pink-700">
                {{ speaker.speakerName }}
                <span class="text-lg font-medium" v-if="speaker.altName"
                  >({{ speaker.altName }})</span
                >
              </p>
              <div class="flex-grow py-1 my-2 border-t border-b border-l border-custom-teal-700">
                <div class="border-t border-b h-6px border-custom-teal-700"></div>
              </div>
            </div>
            <div
              class="w-[245px] xs:w-[300px] sm:w-[245px] h-[245px] xs:h-[300px] sm:h-[245px] p-3 border-b border-l border-r bg-custom-gray-800 border-custom-teal-500"
            >
              <div class="overflow-hidden relative">
                <img
                  :src="`speaker-img/${speaker.id}.jpg`"
                  alt="speaker avatar"
                  class="object-cover"
                />
                <div
                  class="hover-mask absolute top-0 inset-x-0 w-full h-full bg-custom-teal-700 opacity-60"
                ></div>
              </div>
            </div>
          </a>
          <ul class="flex flex-wrap mt-3">
            <li
              v-for="item in speaker.categoryTags"
              :key="item"
              class="border border-custom-teal-700 rounded-md bg-custom-gray-800 text-custom-teal-500 py-1 px-2 mr-[10px] mb-[10px]"
            >
              #{{ item }}
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>

  <FilterTool></FilterTool>
  <div>
    <SpeakerModal
      v-if="!!modalSpeakerData && modalSpeakerData.id !== 'dual'"
      :speakerInfo="modalSpeakerData"
      :onModalClose="() => handleModalClose()"
      :isModalOpen="isModalOpen"
    />
    <DualSpeakerModal
      v-if="!!modalSpeakerData && modalSpeakerData.id === 'dual'"
      :dualSpeakerInfo="modalSpeakerData"
      :onModalClose="() => handleModalClose()"
      :isModalOpen="isModalOpen"
    />
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

.hover-mask {
  background-color: transparent;
  transition: background-color 0.3s ease; /* 添加圖片放大和移動的漸變效果 */
}

.hover-parent:hover .hover-mask {
  background-color: #006a97;
}

.hover-parent:hover img {
  transition: transform 0.3s ease; /* 添加圖片放大和移動的漸變效果 */
  transform: scale(1.1); /* 滑鼠指向時圖片放大的倍率 */
}
</style>

<script setup>
import { onMounted, ref, reactive } from "vue";
import { useRoute } from "vue-router";
import { usePageInfoStore } from "@/stores/pageInfo";
import { useFilterStore } from "@/stores/filter";
import SpeakerModal from "@/components/speaker-modal/SpeakerModal.vue";
import DualSpeakerModal from "@/components/speaker-modal/DualSpeakerModal.vue";
import StylingTitle from "@/components/StylingTitle.vue";
import StylingFBLink from "@/components/StylingFBLink.vue";
import MoveToTop from "@/components/MoveToTop.vue";
import OpenFilter from "@/components/OpenFilter.vue";
import FilterTool from "@/components/FilterComponent.vue";
import SpecialFilter from "@/components/SpecialFilter.vue";
import speakerInfoJSON from "@/content/speakerInfoData.json";

const speakerInfo = speakerInfoJSON.data;
const route = useRoute();

const pageInfoStore = usePageInfoStore();
const { setCurrentPageName } = pageInfoStore;

const filterStore = useFilterStore();
const { isShowSpeaker } = filterStore;

const isModalOpen = ref(false);

const handleModalClose = () => {
  isModalOpen.value = false;
};

const modalSpeakerData = reactive({
  speakerName: "", // 講者名稱
  organization: "", // 公司 / 組織
  jobTitle: "", // 職稱
  personalIntroduction: "", // 個人介紹
  photoURL: "", // 照片，至少 300x300 像素以上
  facebookProfileLink: "", // Facebook 個人社交連結
  twitterProfileLink: "", // Twitter 個人社交連結
  otherLinks: "", // 其他連結 (ex: 個人網站 / 部落格)
  speechTopic: "", // 演講主題（35字內）
  speechSummary: "", // 演講摘要
  categoryTags: [], // 技術標籤
  targetAudience: "", // 目標會眾
  expectedBenefits: "", // 預期收穫
});

const handleOpenSpeakerModal = (event) => {
  const { currentTarget } = event;
  if (currentTarget.tagName === "A" && currentTarget.getAttribute("data-speakerId")) {
    let speakerId = currentTarget.getAttribute("data-speakerId");
    speakerId = speakerId === "lin-yu-cheng" || speakerId === "ke-ren-jie" ? "dual" : speakerId;
    const speaker = speakerInfo.find((element) => element.id === speakerId);
    if (speaker) {
      Object.assign(modalSpeakerData, speaker);
      isModalOpen.value = true;
    }
  }
};

onMounted(() => {
  setCurrentPageName(route.name);
});
</script>

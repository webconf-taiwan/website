<template>
  <div class="relative py-20 md:py-16">
    <div
      ref="fbDecorativeLink"
      class="fixed z-30 hidden transition-opacity duration-300 md:block bottom-6 left-6"
    >
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

    <div class="flex flex-col items-center">
      <ul
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[60px] xl:gap-10 2xl:gap-[60px] mx-10 lg:ml-6 lg:mr-10 2xl:mx-10"
      >
        <li
          v-for="speaker in speakerInfo"
          :key="speaker.speakerName"
          class="w-[245px] xs:w-[300px] sm:w-[245px]"
        >
          <a
            href="#"
            @click.prevent="handleOpenSpeakerModal"
            :data-speakerName="speaker.speakerName"
          >
            <div class="flex py-2 border border-custom-teal-500 bg-custom-gray-800">
              <div class="w-5 py-1 my-2 border-t border-b border-r border-custom-teal-700">
                <div class="border-t border-b h-6px border-custom-teal-700"></div>
              </div>
              <p class="mx-3 text-2xl font-medium text-custom-pink-700">
                {{ speaker.speakerName }}
                <!-- <span class="text-lg font-medium" v-if="speaker.altName"
                    >({{ speaker.altName }})</span
                  > -->
              </p>
              <div class="flex-grow py-1 my-2 border-t border-b border-l border-custom-teal-700">
                <div class="border-t border-b h-6px border-custom-teal-700"></div>
              </div>
            </div>
            <div class="p-3 border-b border-l border-r bg-custom-gray-800 border-custom-teal-500">
              <img
                :src="speaker.photoURL"
                alt="speaker avatar"
                class="w-[245px] xs:w-[300px] sm:w-[245px] h-[245px] xs:h-[300px] sm:h-[245px] object-cover"
              />
            </div>
          </a>
        </li>
      </ul>
    </div>
  </div>

  <!-- <FilterTool></FilterTool> -->
  <div>
    <SpeakerModal
      :speakerInfo="modalSpeakerData"
      :isMoreInfoOpen="false"
      :onModalClose="handleModalClose"
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
</style>

<script setup>
import { onMounted, ref, reactive } from "vue";
import { useRoute } from "vue-router";
import SpeakerModal from "@/components/speaker-modal/SpeakerModal.vue";
import { usePageInfoStore } from "@/stores/pageInfo";
import StylingTitle from "@/components/StylingTitle.vue";
import StylingFBLink from "@/components/StylingFBLink.vue";
import MoveToTop from "@/components/MoveToTop.vue";
// import OpenFilter from "@/components/OpenFilter.vue";
// import FilterTool from "@/components/FilterComponent.vue";
import speakerInfoJSON from "@/content/speakerInfoData.json";

const speakerInfo = speakerInfoJSON.data;
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
  if (currentTarget.tagName === "A" && currentTarget.getAttribute("data-speakerName")) {
    const speaker = speakerInfo.find(
      (element) => element.speakerName === currentTarget.getAttribute("data-speakerName")
    );
    if (speaker) {
      Object.assign(modalSpeakerData, speaker);
      isModalOpen.value = true;
    }
  }
};

onMounted(() => {
  setCurrentPageName(route.name);
  window.addEventListener("scroll", scrollHandler);
});
</script>

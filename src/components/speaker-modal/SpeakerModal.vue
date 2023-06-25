<template>
  <div
    v-if="isModalOpen"
    class="bg-drop-blur fixed inset-0 flex items-center justify-center z-50 bg-custom-teal-700 bg-opacity-20 max-h-screen px-5 py-5 md:py-10"
  >
    <section
      class="relative border-custom-teal-700 border-2 rounded-sm bg-black pb-8 pt-12 px-4 md:px-5 text-white w-[792px] scroll overflow-y-auto max-h-full"
    >
      <button
        @click="closeModal"
        class="absolute top-3 right-5 md:right-7 md:top-5 stroke-current text-custom-teal-500"
      >
        <iconClose class="hover:text-custom-teal-700 active:text-custom-teal-500 w-6 h-6" />
      </button>
      <!-- 講者頭貼 -->
      <div class="flex md:px-3 mb-9 md:mb-5 flex-col md:flex-row items-center md:items-stretch">
        <img
          class="mb-5 md:mb-0 mx-auto w-full max-w-[360px] max-h-[360px] md:w-[150px] md:h-[150px] border-2 border-custom-teal-500 md:mr-5 md:ml-0 object-contain"
          :src="props.speakerInfo.photoURL"
        />
        <div class="flex flex-col">
          <h2
            class="text-custom-teal-500 font-semibold text-2xl md:text-3xl mb-3 text-center md:text-left"
          >
            {{ props.speakerInfo.speakerName }}
          </h2>
          <p class="mb-5 md:mb-auto">
            {{ `${props.speakerInfo.organization} ${props.speakerInfo.jobTitle}` }}
          </p>

          <div
            class="flex text-custom-teal-500 justify-center md:justify-start gap-3 md:gap-2 -ml-1"
          >
            <a
              :href="props.speakerInfo.facebookProfileLink"
              v-show="props.speakerInfo.facebookProfileLink"
              class="hover:text-custom-teal-700 active:text-custom-teal-500"
            >
              <iconFacebook class="stroke-current md:w-6 md:h-6" />
            </a>

            <a
              :href="props.speakerInfo.twitterProfileLink"
              v-show="props.speakerInfo.twitterProfileLink"
              class="hover:text-custom-teal-700 active:text-custom-teal-500"
            >
              <iconTwitter class="svg-fill-current md:w-6 md:h-6" />
            </a>
            <a
              :href="props.speakerInfo.otherLinks"
              v-show="props.speakerInfo.otherLinks"
              class="hover:text-custom-teal-700 active:text-custom-teal-500"
            >
              <iconLink class="svg-fill-current md:w-5 md:h-5" />
            </a>
          </div>
        </div>
      </div>

      <!-- 講者介紹 -->
      <div class="md:px-3 mb-3">
        <h3 class="font-semibold text-lg md:text-xl text-custom-teal-500 leading-tight mb-2">
          講者介紹
        </h3>
        <p class="leading-normal">{{ props.speakerInfo.personalIntroduction }}</p>
      </div>

      <!-- 議程資訊 -->
      <div
        @click="toggleMoreInfo"
        class="cursor-pointer flex items-center justify-start border-b border-custom-teal-500 md:px-3 py-3 text-custom-teal-500"
      >
        <h3 class="text-lg md:text-xl font-semibold leading-tight mr-2">議程資訊</h3>
        <iconArrowUp v-show="isMoreInfoOpen" class="stroke-current" />
        <iconArrowDown v-show="!isMoreInfoOpen" class="stroke-current" />
      </div>
      <Transition name="slide-fade">
        <section class="md:px-3 pt-6" v-show="isMoreInfoOpen">
          <h1 class="text-custom-teal-500 text-xl md:text-3xl font-semibold mb-2">
            {{ props.speakerInfo.speechTopic }}
          </h1>
          <div class="flex text-custom-pink-700 items-center justify-start leading-none mb-7">
            <iconTime class="svg-fill-current stroke-0 mr-1" />
            <p class="mr-5 pt-[1px]">{{ props.speakerInfo.date }} {{ props.speakerInfo.time }}</p>
            <iconLocation class="stroke-current mr-1" />
            <p class="align-middle pt-[3px]">講廳 {{ props.speakerInfo.location }}</p>
          </div>
          <div class="mb-5">
            <p class="mb-3">{{ props.speakerInfo.speechSummary }}</p>
            <CategoryTag :tag="tag" v-for="tag in props.speakerInfo.categoryTags" :key="tag" />
          </div>
          <div class="mb-5">
            <h3 class="font-semibold text-lg md:text-xl text-custom-teal-500 leading-tight mb-2">
              目標會眾
            </h3>
            <p>
              {{ props.speakerInfo.targetAudience }}
            </p>
          </div>

          <div class="mb-5">
            <h3 class="font-semibold text-lg md:text-xl text-custom-teal-500 leading-tight mb-2">
              預期收穫
            </h3>
            <p>
              {{ props.speakerInfo.expectedBenefits }}
            </p>
          </div>

          <div class="flex flex-col-reverse md:flex-row gap-3">
            <button class="primary-button">
              <iconShare />
              <p>分享議程</p>
            </button>
            <button class="secondary-button">
              <iconNote class="stroke-current" />
              <p>共筆文件</p>
            </button>
            <button class="secondary-button">
              <iconDate class="stroke-current" />
              <p>加入行事曆</p>
            </button>
          </div>
        </section>
      </Transition>
    </section>
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";
import CategoryTag from "@/components/CategoryTag.vue";

import iconTime from "@/assets/images/icon/ic_time_s.svg";
import iconLocation from "@/assets/images/icon/ic_location_s.svg";
import iconClose from "@/assets/images/icon/ic_close_s.svg";
import iconArrowDown from "@/assets/images/icon/ic_arrow_down_s.svg";
import iconArrowUp from "@/assets/images/icon/ic_arrow_up_s.svg";
import iconFacebook from "@/assets/images/icon/ic_fb_l.svg";
import iconTwitter from "@/assets/images/icon/ic_twitter_l.svg";
import iconLink from "@/assets/images/icon/ic_web_l.svg";
import iconShare from "@/assets/images/icon/ic_share_s.svg";
import iconDate from "@/assets/images/icon/ic_date_s.svg";
import iconNote from "@/assets/images/icon/ic_note_s.svg";

const props = defineProps({
  isMoreInfoOpen: {
    default: false,
    type: Boolean,
  },
  speakerInfo: {
    speakerName: String,
    organization: String,
    jobTitle: String,
    personalIntroduction: String,
    photoURL: String,
    facebookProfileLink: String,
    twitterProfileLink: String,
    otherLinks: String,
    speechTopic: String,
    speechSummary: String,
    categoryTags: [String],
    targetAudience: String,
    expectedBenefits: String,
    date: String,
    time: String,
    location: String,
  },
});

const isModalOpen = ref(true);
const isMoreInfoOpen = ref(props.isMoreInfoOpen);

const closeModal = () => {
  isModalOpen.value = false;
};

const toggleMoreInfo = () => {
  isMoreInfoOpen.value = !isMoreInfoOpen.value;
};
</script>

<style>
.bg-drop-blur {
  backdrop-filter: blur(8px);
}

.svg-fill-current path {
  fill: currentColor;
}

.svg-scale-50 {
  transform: scale(0.5);
  width: 20px;
  height: 20px;
}

.stroke-current path {
  stroke: currentColor;
}

::-webkit-scrollbar {
  width: 4px;
  background-color: black;
}

::-webkit-scrollbar-thumb {
  background-color: #3ef0fc;
  border-radius: 2px;
}

.primary-button {
  @apply flex gap-1 justify-center items-center leading-none py-3 px-7 text-base;
  @apply bg-custom-teal-500 text-black;
  @apply border-transparent border;
}

.primary-button p,
.secondary-button p {
  @apply pt-[2px];
}

.secondary-button {
  @apply flex gap-1  justify-center items-center leading-none py-3 px-7 text-base;
  @apply bg-transparent text-custom-teal-500;
  @apply border-custom-teal-500 border;
}

.primary-button:hover,
.secondary-button:hover {
  @apply bg-custom-teal-700 text-custom-teal-500 border-custom-teal-500 border;
}

.primary-button:active,
.secondary-button:active {
  @apply bg-custom-teal-500  text-black;
}
</style>

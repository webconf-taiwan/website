<template>
  <div
    v-if="isModalOpen"
    class="bg-drop-blur fixed inset-0 flex items-center justify-center z-50 bg-custom-teal-700 bg-opacity-20 max-h-screen py-10"
  >
    <section
      class="relative border-custom-teal-700 border-2 rounded-sm bg-black pb-8 pt-12 px-5 text-white w-[792px] scroll overflow-y-auto max-h-full"
    >
      <button
        @click="closeModal"
        class="absolute right-7 top-5 stroke-current text-custom-teal-500"
      >
        <iconClose />
      </button>
      <!-- 講者頭貼 -->
      <div class="flex px-3 mb-5">
        <img
          class="w-[150px] h-[150px] border-2 border-custom-teal-500 mr-5 object-contain"
          :src="props.speakerInfo.photoURL"
        />
        <div>
          <h2 class="text-custom-teal-500 font-semibold text-3xl mb-3">
            {{ props.speakerInfo.speakerName }}
          </h2>
          <p>{{ `${props.speakerInfo.organization} ${props.speakerInfo.jobTitle}` }}</p>
        </div>
      </div>

      <!-- 講者介紹 -->
      <div class="px-3 py-2 mb-3">
        <h2 class="font-semibold text-xl text-custom-teal-500 leading-tight mb-2">講者介紹</h2>
        <p class="leading-normal">{{ props.speakerInfo.personalIntroduction }}</p>
      </div>

      <!-- 議程資訊 -->
      <div
        @click="toggleMoreInfo"
        class="cursor-pointer flex items-center justify-start border-b border-custom-teal-500 p-3 font-semibold text-xl leading-tight text-custom-teal-500"
      >
        <h2 class="mr-2">議程資訊</h2>
        <iconArrowUp v-show="isMoreInfoOpen" class="stroke-current" />
        <iconArrowDown v-show="!isMoreInfoOpen" class="stroke-current" />
      </div>
      <div class="px-3 pt-6" v-show="isMoreInfoOpen">
        <h1 class="text-custom-teal-500 text-3xl font-semibold mb-2">
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
        <div>
          <h3 class="font-semibold text-xl text-custom-teal-500 leading-tight mb-2">目標會眾</h3>
          <p>
            {{ props.speakerInfo.targetAudience }}
          </p>
        </div>
      </div>
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
</style>

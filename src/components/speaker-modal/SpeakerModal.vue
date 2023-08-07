<template>
  <div
    v-if="isModalOpen"
    class="bg-drop-blur fixed inset-0 flex items-center justify-center z-50 bg-custom-teal-700 bg-opacity-20 max-h-screen px-5 py-5 md:py-10"
  >
    <!-- 避免 click outside 影響箭頭 -->

    <section
      @click.stop
      ref="modalElement"
      class="relative border-custom-teal-700 border-2 rounded-sm bg-black pb-8 pt-12 px-4 md:px-5 text-white w-[792px] scroll overflow-y-auto max-h-full"
    >
      <button
        @click="onModalClose"
        class="absolute top-3 right-5 md:right-7 md:top-5 stroke-current text-custom-teal-500"
      >
        <iconClose class="hover:text-custom-teal-700 active:text-custom-teal-500 w-6 h-6" />
      </button>
      <!-- 講者頭貼 -->
      <div class="flex md:px-3 mb-9 md:mb-5 flex-col md:flex-row items-center md:items-stretch">
        <img
          class="mb-5 md:mb-0 mx-auto w-full max-w-[360px] max-h-[360px] md:w-[150px] md:h-[150px] border-2 border-custom-teal-500 md:mr-5 md:ml-0 object-cover"
          :src="`/speaker-img/${speakerInfo.id}.jpg`"
        />
        <div class="flex flex-col">
          <h2
            class="text-custom-teal-500 font-semibold text-2xl md:text-3xl mb-3 text-center md:text-left"
          >
            {{ speakerInfo.speakerName }}
            <span v-if="speakerInfo.altName">{{ `(${speakerInfo.altName})` }}</span>
          </h2>
          <p class="text-center md:text-left mb-5 md:mb-auto">
            {{ `${speakerInfo.organization} ${speakerInfo.jobTitle}` }}
          </p>

          <div
            class="flex text-custom-teal-500 justify-center md:justify-start gap-3 md:gap-2 -ml-1"
          >
            <a
              :href="speakerInfo.facebookProfileLink"
              v-show="speakerInfo.facebookProfileLink"
              class="transition-colors duration-300 hover:text-custom-teal-700 active:text-custom-teal-500"
            >
              <iconFacebook class="stroke-current md:w-6 md:h-6" />
            </a>

            <a
              :href="speakerInfo.twitterProfileLink"
              v-show="speakerInfo.twitterProfileLink"
              class="transition-colors duration-300 hover:text-custom-teal-700 active:text-custom-teal-500"
            >
              <iconTwitter class="svg-fill-current md:w-6 md:h-6" />
            </a>
            <template v-for="link in speakerInfo.otherLinks" :key="link">
              <a
                :href="link"
                v-if="link !== '' && link.includes('medium')"
                class="transition-colors duration-300 hover:text-custom-teal-700 active:text-custom-teal-500"
              >
                <iconMedium class="stroke-current md:w-6 md:h-6" />
              </a>

              <a
                :href="link"
                v-else-if="link !== '' && link.includes('instagram')"
                class="transition-colors duration-300 hover:text-custom-teal-700 active:text-custom-teal-500"
              >
                <iconIg class="stroke-current md:w-6 md:h-6" />
              </a>

              <a
                :href="link"
                v-else-if="link !== ''"
                class="transition-colors duration-300 hover:text-custom-teal-700 active:text-custom-teal-500"
              >
                <iconLink class="svg-fill-current md:w-6 md:h-6" />
              </a>
            </template>
          </div>
        </div>
      </div>

      <!-- 講者介紹 -->
      <div class="md:px-3 mb-3">
        <h3 class="font-semibold text-lg md:text-xl text-custom-teal-500 leading-tight mb-2">
          講者介紹
        </h3>
        <p class="leading-normal whitespace-pre-line">{{ speakerInfo.personalIntroduction }}</p>
      </div>

      <!-- 議程資訊 -->
      <div
        class="cursor-pointer flex items-center justify-start border-b border-custom-teal-500 md:px-3 py-3 text-custom-teal-500"
      >
        <h3 class="text-lg md:text-xl font-semibold leading-tight mr-2">議程資訊</h3>
      </div>
      <Transition>
        <section class="md:px-3 pt-6">
          <h1 class="text-custom-teal-500 text-xl md:text-3xl font-semibold mb-2">
            {{ speakerInfo.speechTopic }}
          </h1>
          <div
            class="flex text-custom-pink-700 items-center justify-start leading-none mb-7"
            v-show="speakerInfo.date"
          >
            <iconTime class="svg-fill-current stroke-0 mr-1" />
            <p class="mr-5 pt-[1px]">{{ speakerInfo.formattedSession }}</p>
            <iconLocation class="stroke-current mr-1" />
            <p class="align-middle pt-[3px]">講廳 {{ speakerInfo.room }}</p>
          </div>
          <div class="mb-5">
            <p class="mb-3 whitespace-pre-line">{{ speakerInfo.speechSummary }}</p>
            <div class="flex gap-3 flex-wrap">
              <CategoryTag :tag="tag" v-for="tag in speakerInfo.categoryTags" :key="tag" />
            </div>
          </div>
          <div class="mb-5">
            <h3 class="font-semibold text-lg md:text-xl text-custom-teal-500 leading-tight mb-2">
              目標會眾
            </h3>
            <p class="whitespace-pre-line">
              {{ speakerInfo.targetAudience }}
            </p>
          </div>

          <div class="mb-5">
            <h3 class="font-semibold text-lg md:text-xl text-custom-teal-500 leading-tight mb-2">
              預期收穫
            </h3>
            <p class="whitespace-pre-line">
              {{ speakerInfo.expectedBenefits }}
            </p>
          </div>

          <div class="flex flex-col-reverse md:flex-row gap-3">
            <a
              class="secondary-button transition-colors duration-300"
              target="_blank"
              :href="speakerInfo.noteLink"
            >
              <iconNote class="stroke-current" />
              <p>共筆文件</p>
            </a>
            <a
              class="secondary-button transition-colors duration-300"
              target="_blank"
              :href="speakerInfo.googleCalendarLink"
            >
              <iconDate class="stroke-current" />
              <p>加入行事曆</p>
            </a>
          </div>
        </section>
      </Transition>
    </section>
  </div>
</template>

<script setup>
import { ref, defineProps, toRefs, onBeforeUnmount, onMounted, watchEffect } from "vue";

import CategoryTag from "@/components/CategoryTag.vue";

import iconTime from "@/assets/images/icon/ic_time_s.svg";
import iconLocation from "@/assets/images/icon/ic_location_s.svg";
import iconClose from "@/assets/images/icon/ic_close_s.svg";
// import iconArrowDown from "@/assets/images/icon/ic_arrow_down_s.svg";
// import iconArrowUp from "@/assets/images/icon/ic_arrow_up_s.svg";
import iconFacebook from "@/assets/images/icon/ic_fb_l.svg";
import iconTwitter from "@/assets/images/icon/ic_twitter_l.svg";
import iconLink from "@/assets/images/icon/ic_web_l.svg";
import iconIg from "@/assets/images/icon/ic_ig_l.svg";
import iconMedium from "@/assets/images/icon/ic_medium_l.svg";

// import iconShare from "@/assets/images/icon/ic_share_s.svg";
import iconDate from "@/assets/images/icon/ic_date_s.svg";
import iconNote from "@/assets/images/icon/ic_note_s.svg";

const props = defineProps({
  isMoreInfoOpen: {
    default: false,
    type: Boolean,
  },
  isModalOpen: {
    default: false,
    type: Boolean,
  },
  onModalClose: {
    type: Function,
  },
  speakerInfo: {
    speakerName: String,
    altName: String,
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
    formattedSession: String,
    room: String,
    googleCalenderLink: String,
    noteLink: String,
  },
});

// const isMoreInfoOpen = ref(props.isMoreInfoOpen);

const { onModalClose, speakerInfo, isModalOpen } = toRefs(props);

// const toggleMoreInfo = () => {
//   isMoreInfoOpen.value = !isMoreInfoOpen.value;
// };

watchEffect(() => {
  if (typeof window !== "undefined" && window.document) {
    if (isModalOpen.value) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }
});
const onKeydown = (e) => {
  if (e.key === "Escape" && isModalOpen.value) {
    onModalClose.value();
  }
};

const modalElement = ref(null);

const onClickOutside = (e) => {
  if (isModalOpen.value && modalElement.value && !modalElement.value.contains(e.target)) {
    onModalClose.value();
  }
};

let timeoutId;

watchEffect(() => {
  if (isModalOpen.value) {
    timeoutId = setTimeout(() => {
      window.addEventListener("click", onClickOutside);
    }, 100);
  } else {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    window.removeEventListener("click", onClickOutside);
  }
});

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("click", onClickOutside);
});
</script>

<!-- scope 會使svg失效 -->
<style scoped>
.bg-drop-blur {
  backdrop-filter: blur(8px);
}

.svg-fill-current :deep(path) {
  fill: currentColor;
}

.svg-scale-50 {
  transform: scale(0.5);
  width: 20px;
  height: 20px;
}

.stroke-current :deep(path) {
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

/* .v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
} */
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

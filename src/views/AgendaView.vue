<template>
  <div class="relative py-16">
    <div ref="fbDecorativeLink" class="fixed z-30 hidden transition-opacity duration-300 md:block bottom-6 left-6">
      <StylingFBLink></StylingFBLink>
    </div>

    <div class="fixed bottom-32 md:bottom-[57px] right-2 sm:right-1 md:right-[72px] z-30">
      <OpenFilter class="mb-2"></OpenFilter>
      <MoveToTop></MoveToTop>
    </div>
    <a href="#"><div class="logoTxt hidden md:block w-[250px] h-[125px] bg-cover fixed left-0 top-2"></div></a>

    <div class="flex flex-col items-center mt-12 mb-16 md:mt-0">
      <StylingTitle>
        <template #default>
          <span>議程資訊</span>
        </template>
      </StylingTitle>
    </div>

    <SpecialFilter class="mb-8"></SpecialFilter>

    <div class="w-full mx-auto px-5 md:px-[140px]">
      <div class="bg-black relative">
        <div class="flex sticky top-12 md:static z-10">
          <AgendaDateHeading :isActive="activeDate === '08-11'" :onActiveDateClick="() => handleActiveDateClick('08-11')">
            <p class="text-center text-3xl md:text-4xl leading-none font-bold">
              8/11 <span class="text-base md:text-2xl font-semibold">(FRI.)</span>
            </p>
          </AgendaDateHeading>
          <AgendaDateHeading isRight :isActive="activeDate === '08-12'" :onActiveDateClick="() => handleActiveDateClick('08-12')">
            <p class="text-center text-3xl md:text-4xl leading-none font-bold">
              8/12 <span class="text-base md:text-2xl font-semibold">(SAT.)</span>
            </p>
          </AgendaDateHeading>
        </div>
        <div class="p-2 flex flex-col border border-t-0 border-custom-teal-500 gap-2">
          <div class="hidden md:flex gap-2" ref="topHeaderRef">
            <div class="basis-[10%]"></div>
            <div class="basis-[90%] flex gap-2 text-lg">
              <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1001</div>
              <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1101</div>
              <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1003</div>
            </div>
          </div>

          <template v-for="session in filteredAgenda" :key="`${activeDate} ${session.id}`">
            <IntroRow v-if="session.isIntro" :startTime="session.headerText[0]" :endTime="session.headerText[1]" />
            <GeneralRow
              v-if="!session.isKeynote && !session.isBreakTime && !session.isIntro"
              :speakerInfoArr="session.data"
              :startTime="session.headerText[0]"
              :endTime="session.headerText[1]"
              :onOpenSpeakerModal="handleOpenSpeakerModal"
            />

            <KeynoteSpeakerRow
              v-if="session.isKeynote"
              :speakerInfo="session.data[0]"
              :startTime="session.headerText[0]"
              :endTime="session.headerText[1]"
              :onOpenSpeakerModal="handleOpenSpeakerModal"
            />

            <BreakTimeRow v-if="session.isBreakTime" :text="session.data[0]" />
          </template>
        </div>

        <!-- 靜態 Footer -->
        <div class="hidden border border-custom-teal-500 border-t-0 md:flex gap-2 p-2" ref="staticFooterRef">
          <div class="basis-[10%] flex">
            <div
              @click="() => handleActiveDateClick('08-11')"
              class="cursor-pointer text-lg grow flex items-center justify-center"
              :class="{
                'border border-custom-teal-700': activeDate !== '08-11',
                'bg-black': activeDate !== '08-11',
                'text-custom-teal-700': activeDate !== '08-11',
                'bg-custom-teal-500': activeDate === '08-11',
                'text-black': activeDate === '08-11',
              }"
            >
              8/11
            </div>
            <div
              @click="() => handleActiveDateClick('08-12')"
              class="cursor-pointer text-lg grow flex justify-center items-center"
              :class="{
                'border border-custom-teal-700': activeDate !== '08-12',
                'bg-black': activeDate !== '08-12',
                'text-custom-teal-700': activeDate !== '08-12',
                'bg-custom-teal-500': activeDate === '08-12',
                'text-black': activeDate === '08-12',
              }"
            >
              8/12
            </div>
          </div>
          <div class="basis-[90%] flex gap-2 text-lg">
            <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1001</div>
            <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1101</div>
            <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1003</div>
          </div>
        </div>

        <!-- 吸底元件 -->
        <div class="hidden md:block">
          <div
            class="footer right-0 left-0 px-[140px]"
            :class="{
              'footer-visible': isTurnOnDynamicFooter,
              'footer-animated-hidden': !isTurnOnDynamicFooter,
              hidden: isDisableDynamicFooter,
            }"
          >
            <div class="p-2 flex gap-2 border border-custom-teal-500 bg-black">
              <div class="basis-[10%] flex">
                <div
                  @click="() => handleActiveDateClick('08-11')"
                  class="cursor-pointer text-lg grow flex items-center justify-center"
                  :class="{
                    'border border-custom-teal-700': activeDate !== '08-11',
                    'bg-black': activeDate !== '08-11',
                    'text-custom-teal-700': activeDate !== '08-11',
                    'bg-custom-teal-500': activeDate === '08-11',
                    'text-black': activeDate === '08-11',
                  }"
                >
                  8/11
                </div>
                <div
                  @click="() => handleActiveDateClick('08-12')"
                  class="cursor-pointer text-lg grow flex justify-center items-center"
                  :class="{
                    'border border-custom-teal-700': activeDate !== '08-12',
                    'bg-black': activeDate !== '08-12',
                    'text-custom-teal-700': activeDate !== '08-12',
                    'bg-custom-teal-500': activeDate === '08-12',
                    'text-black': activeDate === '08-12',
                  }"
                >
                  8/12
                </div>
              </div>
              <div class="basis-[90%] flex gap-2 text-lg">
                <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1001</div>
                <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1101</div>
                <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1003</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <FilterComponent />

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

.footer {
  transition: all 0.5s ease;
  position: fixed;
  width: inherit;
  bottom: 0;
}

.footer-animated-hidden {
  transform: translateY(100%);
}

.footer-visible {
  transform: translateY(0%);
}
</style>

<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { usePageInfoStore } from "@/stores/pageInfo";
import { useFilterStore } from "@/stores/filter";
import StylingTitle from "@/components/StylingTitle.vue";
import StylingFBLink from "@/components/StylingFBLink.vue";
import MoveToTop from "@/components/MoveToTop.vue";
import AgendaDateHeading from "@/components/agenda/AgendaDateHeading.vue";
import KeynoteSpeakerRow from "@/components/agenda/KeynoteSpeakerRow.vue";
import BreakTimeRow from "@/components/agenda/BreakTimeRow.vue";
import GeneralRow from "@/components/agenda/GeneralRow.vue";
import IntroRow from "@/components/agenda/IntroRow.vue";
import OpenFilter from "@/components/OpenFilter.vue";
import SpecialFilter from "@/components/SpecialFilter.vue";
import FilterComponent from "@/components/FilterComponent.vue";

import speakerAgenda from "@/content/speakerAgenda.json";
import speakerInfoJson from "@/content/speakerInfoData.json";
import SpeakerModal from "@/components/speaker-modal/SpeakerModal.vue";
import DualSpeakerModal from "@/components/speaker-modal/DualSpeakerModal.vue";

const speakerInfoArr = speakerInfoJson.data;

const filterStore = useFilterStore();
const { filterOptions } = storeToRefs(filterStore);

const route = useRoute();

const pageInfoStore = usePageInfoStore();
const { setCurrentPageName } = pageInfoStore;

const fbDecorativeLink = ref();

const handleFBScroll = () => {
  const { scrollTop } = document.documentElement;
  const { clientHeight } = document.documentElement;
  const isBottom = scrollTop > clientHeight + 300;

  fbDecorativeLink.value.style.opacity = isBottom ? 0 : 1;
};

const isTurnOnDynamicFooter = ref(false);
const isDisableDynamicFooter = ref(false);
const isStaticFooterVisible = ref(false);

const genDefaultActiveDate = () => {
  const today = new Date();
  let month = today.getMonth() + 1;
  let day = today.getDate();

  if (month < 10) {
    month = `0${month}`;
  }
  if (day < 10) {
    day = `0${day}`;
  }
  const currentDate = `${month}-${day}`;

  if (currentDate === "08-11" || currentDate === "08-12") {
    return currentDate;
  }
  return "08-11";
};

const activeDate = ref(genDefaultActiveDate());

const activeAgenda = computed(() => speakerAgenda[activeDate.value]);

const speakerInfoMap = speakerInfoArr.reduce((acc, speaker) => {
  acc[speaker.id] = speaker;
  return acc;
}, {});

const activeSpeakerId = ref(null);
const isModalOpen = ref(true);
const modalSpeakerData = computed(() => {
  return speakerInfoMap[activeSpeakerId.value];
});

const genSpeakerInfoArr = (sessionData) => {
  const filteredArr = sessionData.map((id) => {
    const speakerData = speakerInfoMap[id];
    if (filterOptions.value.agenda.length === 0) return speakerData;

    return filterOptions.value.agenda.some((option) => speakerData.categoryTags.includes(option)) ? speakerData : null;
  });

  return filteredArr;
};

const filteredAgenda = computed(() => {
  const filterAgendaRaw = activeAgenda.value.filter((session) => {
    if (filterOptions.value.agenda.length === 0) return true;
    if (session.isBreakTime || session.isIntro) return false;
    const sessionSpeakerInfo = genSpeakerInfoArr(session.data);
    return sessionSpeakerInfo.some((speaker) => speaker !== null);
  });

  return filterAgendaRaw.map((session) => {
    const sessionData = session.isBreakTime ? session.data : genSpeakerInfoArr(session.data);
    return {
      ...session,
      data: sessionData,
    };
  });
});

const handleOpenSpeakerModal = (id) => {
  activeSpeakerId.value = id;
  isModalOpen.value = true;
};

const handleModalClose = () => {
  isModalOpen.value = false;
};

const handleActiveDateClick = (dateStr) => {
  activeDate.value = dateStr;
};
const lastScrollTop = ref(0);

const handleFooterScroll = () => {
  if (isDisableDynamicFooter.value) {
    return;
  }

  const st = window.pageYOffset || document.documentElement.scrollTop;
  if (st > lastScrollTop.value) {
    isTurnOnDynamicFooter.value = true;
  }

  if (!isStaticFooterVisible.value && st < lastScrollTop.value) {
    isTurnOnDynamicFooter.value = false;
  }

  if (isStaticFooterVisible.value && st < lastScrollTop.value) {
    isTurnOnDynamicFooter.value = true;
  }

  lastScrollTop.value = st;
};

let scrollDownObserver = null;
let isStaticFooterObserver = null;

const staticFooterRef = ref(null);
const topHeaderRef = ref(null);

const checkTopHeaderRefVisibility = () => {
  const rect = topHeaderRef.value.getBoundingClientRect();
  if (rect.bottom < 50) {
    // header 在上面
    handleFooterScroll();
  }
};

onBeforeUnmount(() => {
  window.removeEventListener("scroll", checkTopHeaderRefVisibility);

  if (scrollDownObserver) {
    scrollDownObserver.disconnect();
  }
});

onMounted(() => {
  window.addEventListener("scroll", checkTopHeaderRefVisibility);

  setCurrentPageName(route.name);
  window.addEventListener("scroll", handleFBScroll);

  scrollDownObserver = new IntersectionObserver(
    ([entry]) => {
      isDisableDynamicFooter.value = entry.isIntersecting;
    },
    {
      threshold: 1,
    }
  );

  scrollDownObserver.observe(staticFooterRef.value);

  isStaticFooterObserver = new IntersectionObserver(
    ([entry]) => {
      isStaticFooterVisible.value = entry.isIntersecting;
    },
    {
      threshold: 0,
    }
  );

  isStaticFooterObserver.observe(staticFooterRef.value);
});
</script>

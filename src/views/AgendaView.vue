<template>
  <div class="relative py-16">
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

    <div class="flex flex-col items-center mt-12 mb-16 md:mt-0">
      <StylingTitle>
        <template #default>
          <span>議程資訊</span>
        </template>
      </StylingTitle>
    </div>

    <div class="w-full mx-auto px-5 md:px-[140px]">
      <div class="bg-black relative">
        <div class="flex sticky top-12 md:static z-10">
          <AgendaDateHeading
            :isActive="activeDate === '08-11'"
            :onActiveDateClick="handleActiveDateClick('08-11')"
          >
            <p class="text-center text-3xl md:text-4xl leading-none font-bold">
              8/11 <span class="text-base md:text-2xl font-semibold">(FRI.)</span>
            </p>
          </AgendaDateHeading>
          <AgendaDateHeading
            isRight
            :isActive="activeDate === '08-12'"
            :onActiveDateClick="handleActiveDateClick('08-12')"
          >
            <p class="text-center text-3xl md:text-4xl leading-none font-bold">
              8/12 <span class="text-base md:text-2xl font-semibold">(SAT.)</span>
            </p>
          </AgendaDateHeading>
        </div>
        <div class="p-2 flex flex-col border border-t-0 border-custom-teal-500 gap-2">
          <div class="hidden md:flex gap-2">
            <div class="basis-[10%]"></div>
            <div class="basis-[90%] flex gap-2 text-lg">
              <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1001</div>
              <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1101</div>
              <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1002</div>
            </div>
          </div>

          <template v-for="session in activeAgenda" :key="session.id">
            <GeneralRow
              v-if="!session.isKeynote && !session.isBreakTime"
              :speakerInfoArr="session.data.map((id) => (speakerInfo = speakerInfoMap[id]))"
              :startTime="session.headerText[0]"
              :endTime="session.headerText[1]"
            />

            <KeynoteSpeakerRow
              v-if="session.isKeynote"
              :speakerInfo="speakerInfoMap[session.data[0]]"
              :startTime="session.headerText[0]"
              :endTime="session.headerText[1]"
            />

            <BreakTimeRow v-if="session.isBreakTime" :text="session.data[0]" />
          </template>
        </div>

        <!-- 靜態 Footer -->
        <div
          class="hidden border border-custom-teal-500 border-t-0 md:flex gap-2 p-2"
          ref="staticFooterRef"
        >
          <div class="basis-[10%] flex">
            <div
              class="text-lg grow bg-custom-teal-500 text-black flex items-center justify-center"
            >
              8/11
            </div>
            <div
              class="text-lg grow border border-custom-teal-700 text-custom-teal-700 flex justify-center items-center"
            >
              8/12
            </div>
          </div>
          <div class="basis-[90%] flex gap-2 text-lg">
            <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1001</div>
            <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1101</div>
            <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1002</div>
          </div>
        </div>

        <!-- 吸底元件 -->
        <div class="hidden md:block">
          <div
            class="footer right-0 left-0 px-[140px]"
            :class="{
              'footer-visible': isVisible,
              'footer-animated-hidden': !isVisible,
              hidden: isHideDynamicFooter,
            }"
          >
            <div class="p-2 flex gap-2 border border-custom-teal-500 bg-black">
              <div class="basis-[10%] flex">
                <div
                  class="text-lg grow bg-custom-teal-500 text-black flex items-center justify-center"
                >
                  8/11
                </div>
                <div
                  class="text-lg grow border border-custom-teal-700 text-custom-teal-700 flex justify-center items-center"
                >
                  8/12
                </div>
              </div>
              <div class="basis-[90%] flex gap-2 text-lg">
                <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1001</div>
                <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1101</div>
                <div class="basis-1/3 bg-custom-pink-700 py-3 text-center">講廳 1002</div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
import { useRoute } from "vue-router";
import { usePageInfoStore } from "@/stores/pageInfo";
import StylingTitle from "@/components/StylingTitle.vue";
import StylingFBLink from "@/components/StylingFBLink.vue";
import MoveToTop from "@/components/MoveToTop.vue";
import AgendaDateHeading from "@/components/agenda/AgendaDateHeading.vue";
import KeynoteSpeakerRow from "@/components/agenda/KeynoteSpeakerRow.vue";
import BreakTimeRow from "@/components/agenda/BreakTimeRow.vue";
import GeneralRow from "@/components/agenda/GeneralRow.vue";
import speakerAgenda from "@/content/speakerAgenda.json";
import speakerInfoJson from "@/content/speakerInfoData.json";

const speakerInfoArr = speakerInfoJson.data;

const route = useRoute();

const pageInfoStore = usePageInfoStore();
const { setCurrentPageName } = pageInfoStore;

const fbDecorativeLink = ref();

const handleFBScroll = () => {
  const { scrollTop } = document.documentElement;
  const clientHeight = document.documentElement.clientHeight - 470;
  const isBottom = scrollTop > clientHeight;

  fbDecorativeLink.value.style.opacity = isBottom ? 0 : 1;
};

const isVisible = ref(false);
const isHideDynamicFooter = ref(false);
const isStaticFooterVisible = ref(false);

const activeDate = ref("08-11");

const activeAgenda = computed(() => speakerAgenda[activeDate.value]);

const speakerInfoMap = computed(() =>
  speakerInfoArr.reduce((acc, speaker) => {
    acc[speaker.id] = speaker;
    return acc;
  }, {})
);

const handleActiveDateClick = (dateStr) => () => {
  activeDate.value = dateStr;
};

const lastScrollTop = ref(0);

const handleFooterScroll = () => {
  if (isHideDynamicFooter.value) {
    return;
  }

  const st = window.pageYOffset || document.documentElement.scrollTop;
  if (st > lastScrollTop.value) {
    isVisible.value = true;
  }

  if (!isStaticFooterVisible.value && st < lastScrollTop.value) {
    isVisible.value = false;
  }

  if (isStaticFooterVisible.value && st < lastScrollTop.value) {
    isVisible.value = true;
  }

  lastScrollTop.value = st;
};

let scrollDownObserver = null;
let isStaticFooterObserver = null;

const staticFooterRef = ref(null);

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleFooterScroll, false);

  if (scrollDownObserver) {
    scrollDownObserver.disconnect();
  }
});

onMounted(() => {
  window.addEventListener("scroll", handleFooterScroll, false);

  setCurrentPageName(route.name);
  window.addEventListener("scroll", handleFBScroll);

  scrollDownObserver = new IntersectionObserver(
    ([entry]) => {
      isHideDynamicFooter.value = entry.isIntersecting;
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

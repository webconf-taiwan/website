<template>
  <!-- 當增加 header menu 的列表時 高度要增加 h-[524px] 每新增一個列表 + 88px -->
  <header
    class="fixed top-0 z-30 flex flex-col justify-between w-screen h-12 py-1 overflow-hidden duration-500 border-b md:right-0 md:w-60px md:h-screen bg-custom-gray-800 md:flex-row-reverse md:border-l md:border-b-0 border-custom-teal-700 transition-height"
    :class="{ 'h-[524px]': isShowMenuList, 'md:w-[270px]': isShowMenuList }"
  >
    <a href="#" class="h-40 mx-auto w-152"
      ><img src="../assets/images/logo_txt.png" alt="logo" class="h-40 mx-auto w-152 md:hidden"
    /></a>

    <a
      href="#"
      v-if="!isShowMenuList"
      class="absolute z-30 block w-10 h-10 text-lg text-white menuIcon top-1 right-2"
      @click.prevent="toggleMenuList"
    ></a>
    <a
      href="#"
      v-else
      class="absolute z-30 block w-10 h-10 text-lg text-white closeMenuIcon top-1 right-2"
      @click.prevent="toggleMenuList"
    ></a>
    <div
      v-if="!isScrolledToBottom && currentPageName === 'home'"
      class="hidden md:block"
      :class="{ 'md:hidden': isShowMenuList }"
    >
      <p class="absolute z-30 text-lg writing-vertical text-custom-teal-500 bottom-16 right-4">
        scroll
      </p>
      <div
        class="absolute z-30 w-10 h-10 text-lg arrowDownIcon animate-arrowDown bottom-3 right-2"
      ></div>
    </div>

    <div
      v-if="currentPageName === 'home'"
      class="absolute z-20 hidden md:block top-8"
      :class="{ 'md:hidden': isShowMenuList }"
      style="right: 2.5px"
    >
      <div ref="spiderLine" class="spiderLine"></div>
      <div class="relative z-40 bg-cover spider w-14 h-14" style="margin-top: -10px"></div>
    </div>
    <div
      v-else
      class="absolute z-20 hidden md:block top-8"
      :class="{ 'md:hidden': isShowMenuList }"
      style="right: 2.5px"
    >
      <div class="spiderLine animate-spiderLine"></div>
      <div class="relative z-40 bg-cover spider w-14 h-14" style="margin-top: -10px"></div>
    </div>

    <div class="relative flex-shrink-0 hidden md:block w-60px">
      <div v-if="currentPageName === 'home'">
        <a
          href="#"
          class="absolute z-20 p-3 top-1/4 right-3"
          @click.prevent="scrollIntoView(1, true)"
        >
          <div
            class="w-2 h-2 transition-opacity duration-1000 border rounded-full border-custom-teal-500"
            :class="{
              'md:hidden': isShowMenuList,
              'opacity-0': currentSpiderNum === 1,
              'bg-custom-teal-500': currentSpiderNum >= 1,
            }"
          ></div>
        </a>
        <a
          href="#"
          class="p-3 absolute z-20 top-[35%] right-3"
          @click.prevent="scrollIntoView(2, true)"
        >
          <div
            class="w-2 h-2 transition-opacity duration-1000 border rounded-full border-custom-teal-500"
            :class="{
              'md:hidden': isShowMenuList,
              'opacity-0': currentSpiderNum === 2,
              'bg-custom-teal-500': currentSpiderNum >= 2,
            }"
          ></div>
        </a>
        <a
          href="#"
          class="p-3 absolute z-20 top-[45%] right-3"
          @click.prevent="scrollIntoView(3, true)"
        >
          <div
            class="w-2 h-2 transition-opacity duration-1000 border rounded-full border-custom-teal-500"
            :class="{
              'md:hidden': isShowMenuList,
              'opacity-0': currentSpiderNum === 3,
              'bg-custom-teal-500': currentSpiderNum >= 3,
            }"
          ></div>
        </a>
        <a
          href="#"
          class="p-3 absolute z-20 top-[55%] right-3"
          @click.prevent="scrollIntoView(4, true)"
        >
          <div
            class="w-2 h-2 transition-opacity duration-1000 border rounded-full border-custom-teal-500"
            :class="{
              'md:hidden': isShowMenuList,
              'opacity-0': currentSpiderNum === 4,
              'bg-custom-teal-500': currentSpiderNum >= 4,
            }"
          ></div>
        </a>
        <a
          href="#"
          class="p-3 absolute z-20 top-[65%] right-3"
          @click.prevent="scrollIntoView(5, true)"
        >
          <div
            class="w-2 h-2 transition-opacity duration-1000 border rounded-full border-custom-teal-500"
            :class="{
              'md:hidden': isShowMenuList,
              'opacity-0': currentSpiderNum === 5,
              'bg-custom-teal-500': currentSpiderNum >= 5,
            }"
          ></div>
        </a>
        <a
          href="#"
          class="p-3 absolute z-20 top-[75%] right-3"
          @click.prevent="scrollIntoView(6, true)"
        >
          <div
            class="w-2 h-2 transition-opacity duration-1000 border rounded-full border-custom-teal-500"
            :class="{
              'md:hidden': isShowMenuList,
              'opacity-0': currentSpiderNum === 6,
              'bg-custom-teal-500': currentSpiderNum >= 6,
            }"
          ></div>
        </a>
      </div>
    </div>
    <div class="flex justify-start bg-custom-gray-800 text-custom-teal-700">
      <ul class="pb-10 ml-16 md:mt-10">
        <li
          v-for="item in menuList"
          :key="item.ChtName"
          class="mt-6 transition-all duration-300 hover:text-custom-teal-500"
          :class="{
            menuActive: currentPageName === item.home,
            'text-custom-teal-500': currentPageName === item.home,
          }"
        >
          <router-link href="#" :to="{ name: `${item.home}` }" @click="toggleMenuList">
            <p class="text-xl leading-6 whitespace-nowrap md:text-4xl">{{ item.ChtName }}</p>
            <p class="text-sm leading-6 whitespace-nowrap md:text-base">
              {{ item.EngName }}
            </p>
          </router-link>
        </li>
      </ul>
    </div>
  </header>
</template>

<style scoped>
li {
  display: flex;
  position: relative;
}

li::before {
  content: "";
  width: 40px;
  height: 64px;
  position: absolute;
  left: -64px;
  top: -5px;
  background-image: url("@/assets/images/menu_active.svg");
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0;
  transition-property: opacity;
  transition-duration: 1s;
}

li:hover::before {
  opacity: 1;
}

.menuActive::before {
  opacity: 1;
}

.menuIcon {
  background-image: url("@/assets/images/icon/ic_menu_l.svg");
}

.closeMenuIcon {
  background-image: url("@/assets/images/icon/ic_close_l.svg");
}

.arrowDownIcon {
  background-image: url("@/assets/images/icon/ic_scroll_l.svg");
}
.writing-vertical {
  writing-mode: vertical-rl;
}

.spiderLine {
  background: url("@/assets/images/loading_line.svg") no-repeat;
  background-position: center;
}

.spider {
  background-image: url("@/assets/images/spider.svg");
  background-position: top;
}

@keyframes arrowDownAnimation {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(10px);
  }
  100% {
    transform: translateY(0);
  }
}

.animate-arrowDown {
  /* 動畫名稱、持續時間和無限重複 */
  animation: arrowDownAnimation 1s infinite;
}

@keyframes spiderLineAnimation {
  0% {
    height: 150px;
  }
  50% {
    height: 250px;
  }
  100% {
    height: 150px;
  }
}

.animate-spiderLine {
  /* 動畫名稱、持續時間和無限重複 */
  animation: spiderLineAnimation 3s infinite;
}
</style>

<script setup>
import { ref, onMounted, inject } from "vue";
import { storeToRefs } from "pinia";
import { useScrollStore } from "@/stores/scroll";
import { usePageInfoStore } from "@/stores/pageInfo";

const scrollStore = useScrollStore();
const { currentSpiderNum, isClicking, scrollIntoViewFn, toggleSpiderLineHeightFn } =
  storeToRefs(scrollStore);
const { setSpiderLocation } = scrollStore;

const pageInfoStore = usePageInfoStore();
const { currentPageName } = storeToRefs(pageInfoStore);

const gsap = inject("gsap");
const isShowMenuList = ref(false);
const menuList = ref([
  {
    ChtName: "首頁",
    EngName: "Home",
    home: "home",
  },
  {
    ChtName: "議程資訊",
    EngName: "Agenda",
    home: "agenda",
  },
  {
    ChtName: "講者陣容",
    EngName: "Speakers",
    home: "speaker",
  },
  {
    ChtName: "贊助夥伴",
    EngName: "Sponsors",
    home: "sponsors",
  },
  // {
  // ChtName: "主辦團隊",
  // EngName: "Staff",
  // home: "staff",
  // },
  {
    ChtName: "時光機",
    EngName: "Time machine",
    home: "2013WebConf",
  },
]);
const isScrolledToBottom = ref(false);
const spiderLine = ref();

const toggleSpiderLineHeight = (num) => {
  isClicking.value = true;
  const innerHeight = window.innerHeight - 130;
  let height = 0;
  switch (num) {
    case 1:
      height = innerHeight * 0.25;
      break;
    case 2:
      height = innerHeight * 0.35;
      break;
    case 3:
      height = innerHeight * 0.48;
      break;
    case 4:
      height = innerHeight * 0.6;
      break;
    case 5:
      height = innerHeight * 0.72;
      break;
    case 6:
      height = innerHeight * 0.85;
      break;
    default:
      break;
  }
  gsap.to(spiderLine.value, { height, duration: 0.5 });
  setTimeout(() => {
    isClicking.value = false;
  }, 600);
};

const scrollIntoView = (num) => {
  setSpiderLocation(num);
  scrollIntoViewFn.value(num);
  toggleSpiderLineHeight(num);
  // emits('scrollIntoView', num);
};

const toggleMenuList = () => {
  isShowMenuList.value = !isShowMenuList.value;
};

const checkScrollPosition = () => {
  const { scrollY } = window;
  const { innerHeight } = window;
  const { scrollHeight } = document.documentElement;

  if (scrollY + innerHeight >= scrollHeight) {
    isScrolledToBottom.value = true;
  } else {
    isScrolledToBottom.value = false;
  }
};

onMounted(() => {
  window.addEventListener("scroll", checkScrollPosition);
  toggleSpiderLineHeightFn.value = toggleSpiderLineHeight;
  setTimeout(() => {
    scrollIntoView(1, true);
  }, 1000);
});
</script>

<template>
  <header class="py-1 fixed top-0 md:right-0 w-screen md:w-60px h-12 md:h-screen bg-custom-gray-800 z-20 flex flex-col md:flex-row-reverse justify-between border-b md:border-l border-custom-teal-700 overflow-hidden transition-height duration-500" :class="{'h-96': isShowMenuList, 'md:w-64': isShowMenuList}">
    <img src="../assets/images/logo_txt.png" alt="logo" class="w-152 h-40 mx-auto md:hidden">
    <a href="#" v-if="!isShowMenuList" class="menuIcon block w-10 h-10 text-white absolute z-30 top-1 right-2 text-lg" @click.prevent="toggleMenuList"></a>
    <a href="#" v-else class="closeMenuIcon block w-10 h-10 text-white absolute z-30 top-1 right-2 text-lg" @click.prevent="toggleMenuList"></a>
    <div v-if="!isScrolledToBottom" class="hidden md:block" :class="{'md:hidden': isShowMenuList}">
      <p class="writing-vertical text-custom-teal-500 absolute z-30 bottom-16 right-4 text-lg">scroll</p>
      <div class="arrowDownIcon animate-arrowDown w-10 h-10 absolute z-30 bottom-3 right-2 text-lg"></div>
    </div>

    <div class="hidden md:block absolute z-20 top-8" :class="{'md:hidden': isShowMenuList}" style="right: 2.5px">
      <div ref="spiderLine" class="spiderLine">
      </div>
      <div class="spider w-14 h-14 bg-cover relative z-40" style="margin-top: -10px;"></div>
    </div>
    
    <div class="hidden md:block w-60px flex-shrink-0 relative">
      <a href="#" class="w-2 h-2 rounded-full border border-custom-teal-500 absolute z-20 top-1/4 right-6 transition-opacity duration-1000"
      :class="{'md:hidden': isShowMenuList,'opacity-0': currentSpiderNum === 1, 'bg-custom-teal-500': currentSpiderNum >= 1}"
      @click.prevent="scrollIntoView(1)"></a>
      <a href="#" class=" w-2 h-2 rounded-full border border-custom-teal-500 absolute z-20 top-[35%] right-6 transition-opacity duration-1000"
      :class="{'md:hidden': isShowMenuList,'opacity-0': currentSpiderNum === 2, 'bg-custom-teal-500': currentSpiderNum >= 2}"
      @click.prevent="scrollIntoView(2)"></a>
      <a href="#" class=" w-2 h-2 rounded-full border border-custom-teal-500 absolute z-20 top-[45%] right-6 transition-opacity duration-1000"
      :class="{'md:hidden': isShowMenuList,'opacity-0': currentSpiderNum === 3, 'bg-custom-teal-500': currentSpiderNum >= 3}"
      @click.prevent="scrollIntoView(3)"></a>
      <a href="#" class=" w-2 h-2 rounded-full border border-custom-teal-500 absolute z-20 top-[55%] right-6 transition-opacity duration-1000"
      :class="{'md:hidden': isShowMenuList,'opacity-0': currentSpiderNum === 4, 'bg-custom-teal-500': currentSpiderNum >= 4}"
      @click.prevent="scrollIntoView(4)"></a>
      <a href="#" class=" w-2 h-2 rounded-full border border-custom-teal-500 absolute z-20 top-[65%]  right-6 transition-opacity duration-1000"
      :class="{'md:hidden': isShowMenuList,'opacity-0': currentSpiderNum === 5, 'bg-custom-teal-500': currentSpiderNum >= 5}"
      @click.prevent="scrollIntoView(5)"></a>
      <a href="#" class=" w-2 h-2 rounded-full border border-custom-teal-500 absolute z-20 top-[75%] right-6 transition-opacity duration-1000"
      :class="{'md:hidden': isShowMenuList,'opacity-0': currentSpiderNum === 6, 'bg-custom-teal-500': currentSpiderNum >= 6}"
      @click.prevent="scrollIntoView(6)"></a>
    </div>
    <div class="bg-custom-gray-800 text-custom-teal-500 flex justify-start">
      <div class="w-10 h-10 bg-no-repeat bg-contain md:mt-10" style="background-image: url('src/assets/images/menu_active.svg')"></div>
      <ul class="md:mt-10">
        <li v-for="item in menuList" :key="item.ChtName"
      class="py-1">
        <router-link href="#" :to="{ name: `${item.home}` }">
          <p class="whitespace-nowrap text-xl leading-6 md:text-4xl">{{ item.ChtName }}</p>
          <p class="whitespace-nowrap text-sm leading-6 md:text-base">{{ item.EngName }}</p>
        </router-link>
        </li>
      </ul>
    </div>
  </header>
</template>

<style scoped>
.menuIcon {
  background-image: url('src/assets/images/icon/ic_menu_l.svg');
}

.closeMenuIcon {
  background-image: url('src/assets/images/icon/ic_close_l.svg');
}

.arrowDownIcon {
  background-image: url('src/assets/images/icon/ic_scroll_l.svg');
}
.writing-vertical {
  writing-mode: vertical-rl;
}

.spiderLine {
  background: url('src/assets/images/loading_line.svg') no-repeat;
  background-position: center;
}

.spider {
  background-image: url('src/assets/images/spider.svg');
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
  animation: arrowDownAnimation 1s infinite; /* 動畫名稱、持續時間和無限重複 */
}
</style>

<script setup>
import { ref, onMounted, inject } from 'vue';

const gsap = inject('gsap');
const isShowMenuList = ref(false);
const menuList = ref([
  {
  ChtName: "首頁",
  EngName: "Home",
  home: "home",
  },
  {
  ChtName: "議程資訊",
  EngName: "Schedule",
  home: "agenda",
  },
  {
  ChtName: "講者陣容",
  EngName: "Speaker",
  home: "speaker",
  },
  {
  ChtName: "贊助夥伴",
  EngName: "Sponsor",
  home: "",
  },
  {
  ChtName: "主辦單位",
  EngName: "Staff",
  home: "",
  },
  {
  ChtName: "時光機",
  EngName: "Time machine",
  home: "",
  }
  ]);
const isScrolledToBottom = ref(false);
const spiderLine = ref();
const currentSpiderNum = ref();
const emits = defineEmits(['scrollIntoView']);

const scrollIntoView = (num) => {
  currentSpiderNum.value = num;
  toggerSpiderLineHeight(num);
  emits('scrollIntoView', num);
}

const toggerSpiderLineHeight = (num) => {
  const innerHeight = window.innerHeight - 130;
  let height = 0;
  switch (num) {
    case 1:
      height = innerHeight * 0.25
      break;
    case 2:
      height = innerHeight * 0.35
      break;
    case 3:
      height = innerHeight * 0.48
      break;
    case 4:
      height = innerHeight * 0.6
      break;
    case 5:
      height = innerHeight * 0.72
      break;
    case 6:
      height = innerHeight * 0.85
      break;
    default:
      break;
  }
  gsap.to(spiderLine.value, { height , duration: 1 });
}



const toggleMenuList = () => {
  isShowMenuList.value = !isShowMenuList.value;
}

const checkScrollPosition = () => {
  const scrollY = window.scrollY;
  const innerHeight = window.innerHeight;
  const scrollHeight = document.documentElement.scrollHeight;

  if (scrollY + innerHeight >= scrollHeight) {
    isScrolledToBottom.value = true;
  } else {
    isScrolledToBottom.value = false;
  }
};

onMounted(() => {
  window.addEventListener('scroll', checkScrollPosition);
  setTimeout(() => {
    scrollIntoView(1);
  },1000)
  
});

</script>
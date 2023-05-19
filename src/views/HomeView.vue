<template>
<!-- loading 畫面 -->
  <div ref="loading" class="fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-custom-gray-900 z-50">
    <div ref="loadingLine" class="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-custom-teal-500" :style="{ height: `${spiderTop + 20}px` }"></div>
    <div ref="loadingAnime" class="flex flex-col items-center">
      <img src="@/assets/images/spider.svg" class="h-16 mb-2" alt="loading spider" style="transform: rotate(180deg)" ref="spider" />
        <div class="font-bold text-sm text-custom-teal-500">{{ loadingPercent }}%</div>
      </div>
  </div>
<!-- 首頁 -->

<div v-if="showHome" class="mainWidth">
<div class="bgImage bg-no-repeat bg-center bg-fixed bg-cover">
  
    <div class="flex flex-col">
      <!-- 第一區塊開始 -->
      <div ref="section1">
        <div ref="banner" class="mainWidth h-screen flex flex-col justify-center items-center w-full">
          <div class="logo w-60 sm:w-1/2 h-3/4 md:w-full md:h-screen bg-contain bg-no-repeat bg-center flex flex-col justify-between items-center md:items-stretch relative">
            <div class="w-340 h-80 md:w-480 md:h-110 bg-cover bg-no-repeat bg-center mt-4 md:mt-14 md:ml-28 absolute left-1/2 top-[-5%] transform -translate-x-1/2 md:left-60 md:top-6" style="background-image: url('src/assets/images/title_banner.svg')"></div>
            <div class="absolute left-1/2 bottom-[-10%] transform -translate-x-1/2 md:left-3/4 md:bottom-32 lg:bottom-16">
              <div class="flex flex-col md:flex-row items-center justify-end md:mr-20 lg:mr-44">
                <p ref="bannerText" class="whitespace-nowrap text-white text-center md:text-right font-rajdhani font-medium text-lg">In 2023, Webconf Is Happening<br/>Again After Ten Years. </p>
                <button ref="sellBtn" class="whitespace-nowrap mt-6 md:mt-0 md:ml-4 border-2 border-custom-teal-500 text-custom-teal-700 bg-custom-gray-900 px-4 py-2 font-noto-sans font-semibold text-lg cursor-not-allowed">即將開賣</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 第一區塊結束 -->

      <!-- 第二區塊開始 -->
      <div ref="section2" class="md:h-screen relative mx-6 md:mx-24 lg:ml-32 lg:mr-60 my-6 md:my-0 md:pt-12 lg:pt-16">
          <div class="flex flex-col md:flex-row-reverse items-end md:items-center md:justify-end">
            <div class="titleDecoration w-20 h-6"></div>
            <div class="text-center bg-custom-gray-800 border border-custom-teal-500 py-2 px-5 w-full md:w-436 md:mr-2">
              <h1 class="text-custom-teal-500 font-medium text-4xl whitespace-nowrap">WebConf Taiwan
              </h1>
            </div>
          </div>
          
          <div class="py-1 flex items-center border border-custom-teal-500 bg-custom-gray-800">
            <div class="border-b border-t border-r border-custom-teal-700 w-8 mt-1 mb-1 mr-2">
              <div class="my-1 border-b border-t border-custom-teal-700 h-6px"></div>
            </div>
            <p class="text-base font-bold text-custom-pink-700 whitespace-nowrap">BACK TO THE FUTURE OF WEBCONF.
            </p>
            <div class="border-b border-t border-l border-custom-teal-700 flex-grow mt-1 mb-1 ml-2">
              <div class="my-1 border-b border-t border-custom-teal-700 h-6px"></div>
            </div>
          </div>
          <div class="relative">
              <div class="overflow-hidden bg-custom-gray-800 border-b border-r border-custom-teal-500 md:border-l md:py-8">
            <div class="w-full flex md:relative md:left-[-680px]">
              <div class="photo2 fixed-width h-350 bg-cover mr-2 hidden md:block opacity-30"></div>
              <div class="photo1 fixed-width h-350 bg-cover mr-2"></div>
              <div class="photo2 fixed-width h-350 bg-cover hidden md:block opacity-30"></div>
            </div>
          </div>
          <div class="bg-custom-gray-800 border-b border-r border-l border-custom-teal-500 py-1">
            <div class="h-6px border-b border-t border-custom-teal-700"></div>
          </div>
          <div class="scrollbar bg-black border-b border-r border-l border-custom-teal-500 py-5 px-3 md:border-t md:absolute md:right-[-10%] lg:right-[-13%] xl:right-[-10%] md:bottom-[-30%] lg:bottom-[-40%] md:h-200 md:w-300  lg:w-480 xl:w-588 md:overflow-y-auto md:transform md:-translate-y-1/2 ">
            <p class="mb-6 text-white text-base font-medium">在 2023 年重啟十年前的 WebConf 研討會中，帶領與會者穿越時間，探索網路的過去、現在和未來。過去十年間，網路發生了巨大的變化，我們將重新審視網路的起源以及它在這些年裡的演進。</p>
            <p class="mb-6 text-white text-base font-medium">WebConf 不僅僅關注過去，還關注網頁的未來趨勢和新興技術，並提供業界趨勢及發展方向，以協助企業更好地了解未來網頁發展的方向。從人工智慧和機器學習的興起，到行動優化和響應式設計的重要性不斷提高，這個研討會將深入探討網頁開發的未來和企業如何在網頁技術的快速變化中保持競爭優勢。</p>
            <p class="text-white text-base font-medium">我們誠摯地邀請您加入我們，一起穿越時空，探索網頁技術的進，並了解未來十年網頁發展的趨勢。</p>
          </div>
        </div>

        <div class="logoTxt w-138 h-9 absolute md:top-1 md:left-[-92px] lg:left-[-115px]"></div>
        <div class="absolute bottom-6 md:left-[-80px] lg:left-[-110px] hidden md:block">
          <div class="fbIcon w-6 h-6 bg-cover"></div>
          <div class="my-2 mx-2 w-0.5 h-10 bg-custom-teal-500"></div>
          <p class="writing-vertical text-custom-teal-500 text-sm">Webconf 2023 All Rights Reserved.</p>
        </div>
        <div class="logoMan hidden md:block md:w-300 md:h-370 md:bg-cover md:absolute md:top-0 md:right-[-15%] lg:right-[-18%] xl:right-[-14%]">
        </div>
      </div>
      <!-- 第二區塊結束 -->

      <!-- 第三區塊開始 -->
      <div ref="section3" class="md:h-screen relative py-6 px-5">
        <div class="flex flex-col items-end">
          <div class="titleDecoration w-20 h-6"></div>
            <div class="text-center bg-custom-gray-800 border border-custom-teal-500 py-2 px-5 mt-1">
              <h2 class="text-custom-teal-500 font-bold text-3xl whitespace-nowrap md:text-5xl">講者曝光
              </h2>
          </div>
        </div>
        <div class="overflow-hidden">
          <div class="logoMan hidden md:block md:w-213 md:h-263 md:bg-cover md:absolute md:transform md:-translate-x-1/2 md:top-36 md:right-0 lg:right-[-10px]">
          </div>
          <div class="flex justify-around md:flex-col mt-10 md:absolute md:transform md:-translate-x-1/2 md:right-[-450px] lg:right-[-500px]">
            <ul class="flex flex-col md:flex-row-reverse md:mb-4 md:mr-20">
              <li class="flex-shrink-0 mb-4 md:mb-0 md:ml-10" v-for="(item, index) in speaker1" :key="item.mainName">
                <p class="bg-custom-gray-800 text-custom-teal-500 p-1 border-t border-l border-r border-custom-teal-500 text-xl font-bold md:w-40 md:ml-43">{{ item.mainName }} <span class="text-xs font-bold" v-if="item.secondaryName">({{ item.secondaryName }})</span></p>
                <div class="md:flex">
                  <div class="hidden md:block border-b border-l border-t border-custom-teal-500 bg-custom-gray-800 px-2">
                    <div class="h-5 border-r border-l border-b border-custom-teal-700 mx-1 mb-3">
                      <div class="w-2 h-5 border-r border-l border-custom-teal-700 mx-1"></div>
                    </div>
                    <p class="writing-vertical text-custom-pink-700 text-lg font-medium leading-tight mb-3">SPEAKER</p>
                    <div class="h-24 border-r border-l border-t border-custom-teal-700 mx-1">
                      <div class="w-2 h-24 border-r border-l border-custom-teal-700 mx-1"></div>
                    </div>
                  </div>
                  <div class="border border-custom-teal-500 p-1 bg-custom-gray-800">
                    <img class="w-145 h-148 sm:w-202 sm:h-206" :src="item.speaker" alt="speaker" :style="{ opacity: 1 - (index / speaker1.length) }">
                  </div>
                </div>
                
              </li>
            </ul>
            <ul class="flex flex-col md:flex-row-reverse mt-10 md:mt-0">
              <li class="flex-shrink-0 mb-4 md:mb-0 md:ml-10 md:flex md:flex-col-reverse" v-for="(item, index) in speaker2" :key="item.mainName">
                <p class="bg-custom-gray-800 text-custom-teal-500 p-1 border-t border-l border-r md:border-b md:border-t-0 border-custom-teal-500 text-xl font-bold md:w-40 md:ml-43">{{ item.mainName }} <span class="text-xs font-bold" v-if="item.secondaryName">({{ item.secondaryName }})</span></p>
                <div class="md:flex">
                  <div class="hidden md:block border-b border-l border-t border-custom-teal-500 bg-custom-gray-800 px-2">
                    <div class="h-5 border-r border-l border-b border-custom-teal-700 mx-1 mb-3">
                      <div class="w-2 h-5 border-r border-l border-custom-teal-700 mx-1"></div>
                    </div>
                    <p class="writing-vertical text-custom-pink-700 text-lg font-medium leading-tight mb-3">SPEAKER</p>
                    <div class="h-24 border-r border-l border-t border-custom-teal-700 mx-1">
                      <div class="w-2 h-24 border-r border-l border-custom-teal-700 mx-1"></div>
                    </div>
                  </div>
                  <div class="border border-custom-teal-500 p-1 bg-custom-gray-800">
                    <img class="w-145 h-148 sm:w-202 sm:h-206" :src="item.speaker" alt="speaker" :style="{ opacity: 1 - (index / speaker2.length) }">
                  </div>
                </div>
                
              </li>
            </ul>
          </div>
        </div>

        <div class="logoTxt w-138 h-9 absolute md:top-5 md:left-3 lg:left-5"></div>
        <div class="absolute bottom-6 md:left-3 lg:left-5 hidden md:block">
          <div class="fbIcon w-6 h-6 bg-cover"></div>
          <div class="my-2 mx-2 w-0.5 h-10 bg-custom-teal-500"></div>
          <p class="writing-vertical text-custom-teal-500 text-sm">Webconf 2023 All Rights Reserved.</p>
        </div>
      </div>
      <!-- 第三區塊結束 -->

      <!-- 第四區塊開始 -->
      <div ref="section4" class="h-screen">
        <p class="text-white">section4</p>
      </div>
      <!-- 第四區塊結束 -->

      <!-- 第五區塊開始 -->
      <div ref="section5" class="h-screen">
        <p class="text-white">section5</p>
      </div>
      <!-- 第五區塊結束 -->

      <!-- 第六區塊開始 -->
      <div ref="section6" class="h-screen">
        <p class="text-white">section6</p>
      </div>
      <!-- 第六區塊結束 -->
    </div>
      

    <!-- 首頁尾巴 -->
  </div>
</div>
  
</template>

<style scoped>
/* 手機版 */
.bgImage {
  background-image: url('src/assets/images/bg_m.png');
}
.logo {
  background-image: url('src/assets/images/logo_all_m.png');
}
.mainWidth {
  width: 100vw;
}
.titleDecoration {
  background: url('src/assets/images/title_display.svg') no-repeat;
}
.photo1 {
  background-image: url('src/assets/images/photo_1.png');
}
.photo2 {
  background-image: url('src/assets/images/photo_2.png');
}
.fixed-width {
  flex-shrink: 0;
  flex-basis: 701px;
}
.logoMan {
  background-image: url('src/assets/images/logo_man.png');
}
@media (min-width: 768px) {
  .bgImage {
  background-image: url('src/assets/images/bg.png');
  }
  .logo {
    background-image: url('src/assets/images/logo_all.png');
  }
  .mainWidth {
  width: calc(100vw - 60px);
  }
  .scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar::-webkit-scrollbar-track {
    width: 6px;
    background-image: linear-gradient(90deg, transparent, #006A97, transparent);
  }
  .scrollbar::-webkit-scrollbar-thumb {
    background-color: #3EF0FC;
    border-radius: 5px;
  }
  .logoTxt {
    background-image: url('src/assets/images/logo_txt.svg');
  }
  .writing-vertical {
    writing-mode: vertical-rl;
  }
  .fbIcon {
    background-image: url('src/assets/images/icon/ic_fb_l.svg');
  }
}

</style>


<script setup>
import { ref, onMounted, inject } from 'vue';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
const gsap = inject('gsap');
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const showHome = ref(false);
const section1 = ref();
const section2 = ref();
const section3 = ref();
const section4 = ref();
const section5 = ref();
const section6 = ref();

const sections = [section1, section2, section3, section4, section5, section6]

const banner = ref(null);
const bannerText = ref(null)
const sellBtn = ref(null);

const speaker1 = ref([
  {
    mainName: "Ruddy Lee",
    secondaryName: null,
    speaker: "src/assets/images/speaker/speaker_1.png",
  },
  {
    mainName: "曾義峰",
    secondaryName: "Ant",
    speaker: "src/assets/images/speaker/speaker_3.png",
  },
  {
    mainName: "保哥",
    secondaryName: "Will",
    speaker: "src/assets/images/speaker/speaker_5.png",
  },
  {
    mainName: "范聖佑",
    secondaryName: null,
    speaker: "src/assets/images/speaker/speaker_7.png",
  },
  {
    mainName: "Kewang",
    secondaryName: null,
    speaker: "src/assets/images/speaker/speaker_9.png",
  },
  {
    mainName: "Akane Lee",
    secondaryName: null,
    speaker: "src/assets/images/speaker/speaker_11.png",
  },
]);
const speaker2 = ref([
  {
    mainName: "蔡明哲",
    secondaryName: "Richard Tsai",
    speaker: "src/assets/images/speaker/speaker_2.png",
  },
  {
    mainName: "Paul Li",
    secondaryName: null,
    speaker: "src/assets/images/speaker/speaker_4.png",
  },
  {
    mainName: "Kuro",
    secondaryName: null,
    speaker: "src/assets/images/speaker/speaker_6.png",
  },
  {
    mainName: "黃升煌",
    secondaryName: "Mike",
    speaker: "src/assets/images/speaker/speaker_8.png",
  },
  {
    mainName: "王彥博",
    secondaryName: "Soking",
    speaker: "src/assets/images/speaker/speaker_10.png",
  },
  {
    mainName: "本丸",
    secondaryName: "尹曦禾",
    speaker: "src/assets/images/speaker/speaker_12.png",
  },
])

function showHomePage () {
  gsap.to(loading.value, { autoAlpha: 0, duration: 0.5 });
  section1Anime();
}

const section1AnimeTl = gsap.timeline();
const section1LeaveAnimeTl = gsap.timeline();

// const section2AnimeTl = gsap.timeline();

// function onAAAComplete() {
//   gsap.timeline({ onComplete: onAAAComplete})
//   console.log('onAAAComplete');
// }

function section1Anime () {
  
  section1AnimeTl.from(banner.value, { duration: 0.5, scale: 0.5, opacity: 0, ease: 'power4.out' });
  section1AnimeTl.from(sellBtn.value, { duration: 0.5, opacity: 0, ease: 'power4.out' })
  section1AnimeTl.fromTo(
    bannerText.value,
    {
      x: '-30%',
      opacity: 0, 
    },
    {
      x: 0,
      opacity: 1,
      duration: 0.5,
      ease: 'power4.out',
    }
  )
}

function section1LeaveAnime() {
section1LeaveAnimeTl.to(section1.value, { xPercent: 100, opacity: 0, duration: 1 })
section1LeaveAnimeTl.to(section1.value, { xPercent: 0, opacity: 0, duration: 0.2 })
// section1LeaveAnimeTl.to(section1.value, { height: '10px', duration: 0.2 })
}

const scrollIntoView = (num) => {
  switch (num) {
    case 1:
      section1.value.scrollIntoView({ behavior: 'smooth' });
      break;
    case 2:
      section2.value.scrollIntoView({ behavior: 'smooth' });
      break;
    case 3:
      section3.value.scrollIntoView({ behavior: 'smooth' });
      break;
    case 4:
      section4.value.scrollIntoView({ behavior: 'smooth' });
      break;
    case 5:
      section5.value.scrollIntoView({ behavior: 'smooth' });
      break;
    case 6:
      section6.value.scrollIntoView({ behavior: 'smooth' });
      break;
  
    default:
      break;
  }
  
}

// loading
const loading =  ref();
const loadingAnime = ref();
const loadingLine = ref();
const spider = ref();
const loadingPercent = ref(0);

const spiderTop = ref();
// let lineHeight = 100;

let initHeight;
// let calculateY = 0;
// let stage;

// 計算蜘蛛圖片距離視窗最上方的距離
function calculateSpiderTop() {
  const spiderRect = spider.value.getBoundingClientRect();
  spiderTop.value = spiderRect.top + window.pageYOffset;
  if (!initHeight) {
    initHeight = spiderTop.value;
    // stage = initHeight/4;
  }
}

// 更新 loading 畫面的百分比和線條高度
function updateLoading(percent) {
  // loadingPercent.value = percent;
  // gsap.to(loadingLine.value, { height: spiderTop.value + 300, duration: 1 });
  gsap.to(loadingAnime.value, { y: -initHeight, duration: 1 });
  gsap.to(loadingLine.value, { height: 10, duration: 1 });
  setTimeout(() => {
    loadingPercent.value = 100;
  }, 800)
  
  
  // gsap.to(loadingLine.value, { height: spiderTop.value - 50, duration: 0.1 });
  // gsap.to(loadingAnime.value, { y: calculateY - stage, duration: 0.1 });
  // calculateY = calculateY - stage;
  // lineHeight = lineHeight - percent;
}

// function initHome() {
//   sections.forEach((target, index) => {
//     if (index !== 0) {
//       gsap.set(target.value, { visibility: 'hidden' });
//     }
//   });
// }

onMounted(() => {
  // 計算蜘蛛圖片距離視窗最上方的距離
  calculateSpiderTop();

  // 模擬載入過程
  // let progress = 0;
  showHome.value = true;
  setTimeout(() => {
    updateLoading()
    setTimeout(() => {
      showHomePage();
    }, 1000)
  }, 100)

  // initHome();


  // const trigger = ScrollTrigger.create({
  //       trigger: section1.value,
  //       start: 'top top',
  //       // endTrigger: section2.value,
  //       end: 'bottom top',
  //       // markers: true,
  //       onToggle: (self) => {
  //         if (self.isActive) {
  //           section1LeaveAnime();
  //         } else {
  //           // section1LeaveAnimeTl.to(section1.value, { height: '100vh', duration: 0 })
  //           section1LeaveAnimeTl.to(section1.value, { opacity: 1, duration: 0 })
  //           section1AnimeTl.seek(0);
  //         }
  //       },
  //       onEnter: () => {
  //         gsap.to(window ,{ duration: 1, scrollTo: { y: section2.value.offsetTop, autoKill: false } });
  //       },
  // });

//   const trigger1 = ScrollTrigger.create({
//   trigger: section2.value,
//   start: 'top+=50 bottom',
//   endTrigger: section1.value,
//   end: 'top top',
//   markers: true,
//   onToggle: (self) => {
//     console.log(123456);
//     if (self.isActive) {
//       console.log(123);
//       gsap.to(window ,{ duration: 1, scrollTo: { y: section1.value.offsetTop, autoKill: false } });
//     } else {
//       console.log(456);
//     }
//   },
// });

// const trigger1 = ScrollTrigger.create({
//   trigger: section1.value,
//   start: 'top top',
//   endTrigger: section2.value,
//   end: 'bottom top',
//   onToggle: (self) => {
//     if (self.isActive) {
//       section1LeaveAnime();
//     } else {
//       section1LeaveAnimeTl.to(section1.value, { opacity: 1, duration: 0 })
//       section1AnimeTl.seek(0);
//     }
//   },
//   onEnterBack: () => {
//     gsap.to(window ,{ duration: 1, scrollTo: { y: section1.value.offsetTop, autoKill: false } });
//   },
//   onLeave: () => {
//     gsap.to(window ,{ duration: 1, scrollTo: { y: section2.value.offsetTop - 100, autoKill: false } });
//   }
// });
});

defineExpose({
  scrollIntoView,
})
</script>
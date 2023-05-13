<template>
<!-- loading 畫面 -->
  <div ref="loading" class="fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-custom-gray-900 absolute z-10">
    <div ref="loadingLine" class="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-custom-teal-500" :style="{ height: `${spiderTop + 20}px` }"></div>
    <div ref="loadingAnime" class="flex flex-col items-center">
      <img src="@/assets/images/spider.svg" class="h-16 mb-2" alt="loading spider" style="transform: rotate(180deg)" ref="spider" />
        <div class="font-bold text-sm text-custom-teal-500">{{ loadingPercent }}%</div>
      </div>
  </div>
<!-- 首頁 -->

<div v-if="showHome" class="w-screen">
<div class="bgImage bg-no-repeat bg-center bg-fixed bg-cover">
    <div class="flex flex-col">
      <!-- 第一區塊開始 -->
      <div ref="section1">
        <div ref="banner" class="h-screen flex flex-col justify-center items-center w-full">
          <!-- <div class="w-310 h-100 bg-cover bg-no-repeat bg-center mt-4 md:hidden" style="background-image: url('src/assets/images/title_banner.svg')"></div> -->
          <div class="logo w-2/3 sm:w-1/2 h-3/4 md:w-full md:h-screen bg-contain bg-no-repeat bg-center flex flex-col justify-between items-center md:items-stretch relative">
            <div class="w-340 h-95 md:w-480 md:h-130 bg-cover bg-no-repeat bg-center mt-4 md:mt-14 md:ml-28 absolute left-1/2 top-[-12%] transform -translate-x-1/2 md:left-60 md:top-6" style="background-image: url('src/assets/images/title_banner.svg')"></div>
            <div class="absolute left-1/2 bottom-[-10%] transform -translate-x-1/2 md:left-3/4 md:bottom-32 lg:bottom-16">
              <div class="flex flex-col md:flex-row items-center justify-end md:mr-44">
                <p ref="bannerText" class="whitespace-nowrap text-white text-center md:text-right font-rajdhani font-medium text-lg">In 2023, Webconf Is Happening<br/>Again After Ten Years. </p>
                <button ref="sellBtn" class="whitespace-nowrap mt-6 md:mt-0 md:ml-4 border-2 border-custom-teal-500 text-custom-teal-700 bg-custom-gray-900 px-4 py-2 font-noto-sans font-semibold text-lg cursor-not-allowed">即將開賣</button>
              </div>
            </div>
          </div>
          <!-- <div class="flex flex-col items-center justify-end md:hidden">
              <p class="text-white text-center font-rajdhani font-medium text-lg">In 2023, Webconf Is Happening<br/>Again After Ten Y. </p>
              <button class="mt-6 border-2 border-custom-teal-500 text-custom-teal-700 bg-custom-gray-900 px-4 py-2 font-noto-sans font-semibold text-lg cursor-not-allowed">即將開</button>
          </div> -->
        </div>
      </div>
      <!-- 第一區塊結束 -->

      <!-- 第二區塊開始 -->
      <div ref="section2" class="h-screen">
        <p class="text-custom-teal-700 text-7xl">section2</p>
      </div>
      <!-- 第二區塊結束 -->

      <!-- 第三區塊開始 -->
      <div ref="section3" class="h-screen">
        <p class="text-white">section3</p>
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
@media (min-width: 768px) {
  .bgImage {
  background-image: url('src/assets/images/bg.png');
}
  .logo {
    background-image: url('src/assets/images/logo_all.png');
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


  const trigger = ScrollTrigger.create({
        trigger: section1.value,
        start: 'top top',
        // endTrigger: section2.value,
        end: 'bottom top',
        // markers: true,
        onToggle: (self) => {
          if (self.isActive) {
            section1LeaveAnime();
          } else {
            // section1LeaveAnimeTl.to(section1.value, { height: '100vh', duration: 0 })
            section1LeaveAnimeTl.to(section1.value, { opacity: 1, duration: 0 })
            section1AnimeTl.seek(0);
          }
        },
        onEnter: () => {
          gsap.to(window ,{ duration: 1, scrollTo: { y: section2.value.offsetTop, autoKill: false } });
        },
  });

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
</script>
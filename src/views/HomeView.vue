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
  
    <div class="flex flex-col relative">
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
              <h1 class="text-custom-teal-500 font-medium text-4xl whitespace-nowrap font-rajdhani">WebConf Taiwan
              </h1>
            </div>
          </div>
          
          <div class="py-1 flex items-center border border-custom-teal-500 bg-custom-gray-800">
            <div class="border-b border-t border-r border-custom-teal-700 w-8 mt-1 mb-1 mr-2">
              <div class="my-1 border-b border-t border-custom-teal-700 h-6px"></div>
            </div>
            <p class="text-base font-bold text-custom-pink-700 whitespace-nowrap font-rajdhani">BACK TO THE FUTURE OF WEBCONF.
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

        <!-- <div class="logoTxt w-138 h-9 absolute md:top-1 md:left-[-92px] lg:left-[-115px]"></div>
        <div class="absolute bottom-6 md:left-[-80px] lg:left-[-110px] hidden md:block">
          <div class="fbIcon w-6 h-6 bg-cover"></div>
          <div class="my-2 mx-2 w-0.5 h-10 bg-custom-teal-500"></div>
          <p class="writing-vertical text-custom-teal-500 text-sm">Webconf 2023 All Rights Reserved.</p>
        </div> -->

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
                      <div class="w-7px h-5 border-r border-l border-custom-teal-700 mx-1"></div>
                    </div>
                    <p class="writing-vertical text-custom-pink-700 text-lg font-medium leading-tight mb-3 font-rajdhani">SPEAKER</p>
                    <div class="h-105 border-r border-l border-t border-custom-teal-700 mx-1">
                      <div class="w-7px h-105 border-r border-l border-custom-teal-700 mx-1"></div>
                    </div>
                  </div>
                  <div class="border border-custom-teal-500 p-1 bg-custom-gray-800">
                    <img class="w-145 h-148 sm:w-202 sm:h-206 md:hidden" :src="item.speaker" alt="speaker">
                    <img class="w-145 h-148 sm:w-202 sm:h-206 hidden md:block" :src="item.speaker" alt="speaker" :style="{ opacity: 1 - (index / speaker1.length) }">
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
                      <div class="w-7px h-5 border-r border-l border-custom-teal-700 mx-1"></div>
                    </div>
                    <p class="writing-vertical text-custom-pink-700 text-lg font-medium leading-tight mb-3 font-rajdhani">SPEAKER</p>
                    <div class="h-105 border-r border-l border-t border-custom-teal-700 mx-1">
                      <div class="w-7px h-105 border-r border-l border-custom-teal-700 mx-1"></div>
                    </div>
                  </div>
                  <div class="border border-custom-teal-500 p-1 bg-custom-gray-800">
                    <img class="w-145 h-148 sm:w-202 sm:h-206 md:hidden" :src="item.speaker" alt="speaker">
                    <img class="w-145 h-148 sm:w-202 sm:h-206 hidden md:block" :src="item.speaker" alt="speaker" :style="{ opacity: 1 - (index / speaker2.length) }">
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- <div class="logoTxt w-138 h-9 absolute md:top-5 md:left-3 lg:left-5"></div>
        <div class="absolute bottom-6 md:left-3 lg:left-5 hidden md:block">
          <div class="fbIcon w-6 h-6 bg-cover"></div>
          <div class="my-2 mx-2 w-0.5 h-10 bg-custom-teal-500"></div>
          <p class="writing-vertical text-custom-teal-500 text-sm">Webconf 2023 All Rights Reserved.</p>
        </div> -->
      </div>
      <!-- 第三區塊結束 -->

      <!-- 第四區塊開始 -->
      <div ref="section4" class="md:h-screen relative py-6 px-5 overflow-hidden">
        <div class="logoMan hidden md:block md:w-184 md:h-226 md:bg-cover md:absolute md:z-20 md:transform md:-translate-x-1/2 md:top-52 md:right-0"></div>
        
        <div class="flex flex-col items-end mb-8">
          <div class="titleDecoration w-20 h-6"></div>
            <div class="text-center bg-custom-gray-800 border border-custom-teal-500 py-2 px-5 mt-1">
              <h2 class="text-custom-teal-500 font-bold text-3xl whitespace-nowrap md:text-5xl">議程主軸
              </h2>
          </div>
        </div>

        <div class="md:absolute md:top-32  md:left-1 lg:left-[15%]">
          <div class="relative w-335 md:w-374 h-64 mx-auto mb-14">
          <div class="absolute z-10">
            <h3 class="font-rajdhani font-medium text-2xl md:text-56 bg-custom-gray-800 text-custom-teal-500 border-t border-r border-l border-custom-teal-500 w-75 md:w-157 text-center py-3 md:py-4">Web</h3>

            <div class="py-1 border border-custom-teal-500 bg-custom-gray-800 flex">
              <div class="w-5 border-t border-b border-r border-custom-teal-700 my-1 py-1">
                <div class="h-6px border-t border-b border-custom-teal-700"></div>
              </div>
              <p class="font-rajdhani text-custom-pink-700 font-semibold mx-3">WEB DEVELOPMENT</p>
              <div class="border-t border-b border-l border-custom-teal-700 my-1 py-1 flex-grow">
                <div class="h-6px border-t border-b border-custom-teal-700"></div>
              </div>
            </div>

            <div class="py-4 px-3 md:p-8 bg-custom-gray-800 border-custom-teal-500 border-b border-r border-l">
              <p class="font-medium text-white">
              包含 Frontend、Backend、DevOps、技術管理等相關議題。將深入探討各種 Web 技術的最新趨勢、過往發展，以及如何透過這些技術來提升網站或應用程式的品質、效能與安全性。
              </p>
            </div>
          </div>
          <div class="w-335 md:w-374 h-180 md:h-212 border border-custom-teal-500 bg-custom-gray-800 opacity-80 absolute top-[61px] md:top-[101px] left-[-15px] md:left-[-32px] z-[9]"></div>
          <div class="w-335 md:w-374 h-180 md:h-212 border border-custom-teal-500 bg-custom-gray-800 opacity-60 absolute top-[71px] md:top-[129px] left-[-30px] md:left-[-60px] z-[8]"></div>
          <div class="w-335 md:w-374 h-180 md:h-212 border border-custom-teal-500 bg-custom-gray-800 opacity-40 absolute top-[81px] md:top-[153px] left-[-45px] md:left-[-84px] z-[7]"></div>
          <div class="w-335 md:w-374 h-180 md:h-212 border border-custom-teal-500 bg-custom-gray-800 opacity-20 absolute top-[91px] md:top-[173px] left-[-60px] md:left-[-104px] z-[6]"></div>
        </div>
        </div>
        

        <div class="md:absolute md:bottom-10 lg:bottom-[10%] md:right-1 lg:right-[10%]">
          <div class="relative w-335 md:w-374 h-64 mx-auto">
          <div class="absolute z-10">
            <h3 class="font-rajdhani font-medium text-2xl md:text-56 bg-custom-gray-800 text-custom-teal-500 border-t border-r border-l border-custom-teal-500 w-75 md:w-157 text-center py-3 md:py-4">UI/UX</h3>

            <div class="py-1 border border-custom-teal-500 bg-custom-gray-800 flex">
              <div class="w-5 border-t border-b border-r border-custom-teal-700 my-1 py-1">
                <div class="h-6px border-t border-b border-custom-teal-700"></div>
              </div>
              <p class="font-rajdhani text-custom-pink-700 font-semibold mx-3">UI/UX DESIGN</p>
              <div class="border-t border-b border-l border-custom-teal-700 my-1 py-1 flex-grow">
                <div class="h-6px border-t border-b border-custom-teal-700"></div>
              </div>
            </div>

            <div class="py-4 px-3 md:p-8 bg-custom-gray-800 border-custom-teal-500 border-b border-r border-l">
              <p class=" font-medium text-white">
              本屆科技年會將探討 UI/UX 設計的最新趨勢，包括使用者界面設計、使用者體驗優化、人機互動設計等議題，以深入探討如何打造出引人入勝的用戶體驗，提升產品的價值和競爭力。
              </p>
            </div>
          </div>
          <div class="w-335 md:w-374 h-180 md:h-212 border border-custom-teal-500 bg-custom-gray-800 opacity-80 absolute top-[25px] md:top-[35px] left-[-15px] md:left-[-32px] z-[9]"></div>
          <div class="w-335 md:w-374 h-180 md:h-212 border border-custom-teal-500 bg-custom-gray-800 opacity-60 absolute top-[13px] md:top-[7px] left-[-30px] md:left-[-60px] z-[8]"></div>
          <div class="w-335 md:w-374 h-180 md:h-212 border border-custom-teal-500 bg-custom-gray-800 opacity-40 absolute top-[6px] md:top-[-17px] left-[-45px] md:left-[-84px] z-[7]"></div>
          <div class="w-335 md:w-374 h-180 md:h-212 border border-custom-teal-500 bg-custom-gray-800 opacity-20 absolute top-0 md:top-[-37px] left-[-60px] md:left-[-104px] z-[6]"></div>
        </div>
        </div>
        

        
      </div>
      <!-- 第四區塊結束 -->

      <!-- 第五區塊開始 -->
      <div ref="section5" class="md:h-screen relative py-6 px-5 overflow-hidden">
        <div class="flex flex-col items-end mb-8">
          <div class="titleDecoration w-20 h-6"></div>
            <div class="text-center bg-custom-gray-800 border border-custom-teal-500 py-2 px-5 mt-1">
              <h2 class="text-custom-teal-500 font-bold text-3xl whitespace-nowrap md:text-5xl">交通資訊
              </h2>
          </div>
        </div>

        <div class="mb-5 md:mb-0">
          <h4 class="text-32 leading-normal font-semibold text-custom-teal-500 py-2 bg-custom-gray-800 border border-custom-teal-500 text-center">張榮發國際會議中心</h4>
          <div class="flex bg-custom-gray-800 justify-center items-center border-b border-r border-l border-custom-teal-500 py-2 w-253">
            <div class="locationIcon w-5 h-5 mr-2"></div>
            <p class="text-white text-sm leading-normal font-medium">100 台北市中正區中山南路 11 號</p>
          </div>
        </div>

        <div>
          <ul class="flex justify-between">
            <li class="border border-custom-teal-500 bg-custom-gray-800 flex-1 opacity-40" :class="{'opacity-100': currentTrafficInfo.transportation === 'car'}">
              <a href="#" class="block font-rajdhani text-lg text-custom-pink-700" @click.prevent="toggleTrafficInfo('car', '開車')">
                <div class="flex justify-between py-1">
                  <div class="flex-1 my-1.5 py-1 border-t border-b border-r border-custom-teal-700">
                    <div class="border-t border-b border-custom-teal-700 h-6px"></div>
                  </div>
                  <p class="mx-2">BY CAR</p>
                  <div class="flex-1 my-1.5 py-1 border-t border-b border-l border-custom-teal-700">
                    <div class="border-t border-b border-custom-teal-700 h-6px"></div>
                  </div>
                </div>
                </a>
            </li>
            <li class="border border-custom-teal-500 bg-custom-gray-800 flex-1 opacity-40" :class="{'opacity-100': currentTrafficInfo.transportation === 'MRT'}">
              <a href="#" class="block font-rajdhani text-lg text-custom-pink-700" @click.prevent="toggleTrafficInfo('MRT', '搭捷運')">
                <div class="flex justify-between py-1">
                  <div class="flex-1 my-1.5 py-1 border-t border-b border-r border-custom-teal-700">
                    <div class="border-t border-b border-custom-teal-700 h-6px"></div>
                  </div>
                  <p class="mx-2">BY MRT</p>
                  <div class="flex-1 my-1.5 py-1 border-t border-b border-l border-custom-teal-700">
                    <div class="border-t border-b border-custom-teal-700 h-6px"></div>
                  </div>
                </div>
                </a>
            </li>
            <li class="border border-custom-teal-500 bg-custom-gray-800 flex-1 opacity-40" :class="{'opacity-100': currentTrafficInfo.transportation === 'bus'}">
              <a href="#" class="block font-rajdhani text-lg text-custom-pink-700"  @click.prevent="toggleTrafficInfo('bus', '搭公車')">
                <div class="flex justify-between py-1">
                  <div class="flex-1 my-1.5 py-1 border-t border-b border-r border-custom-teal-700">
                    <div class="border-t border-b border-custom-teal-700 h-6px"></div>
                  </div>
                  <p class="mx-2">BY BUS</p>
                  <div class="flex-1 my-1.5 py-1 border-t border-b border-l border-custom-teal-700">
                    <div class="border-t border-b border-custom-teal-700 h-6px"></div>
                  </div>
                </div>
                </a>
            </li>
          </ul>

          <div class="bg-custom-gray-800 border border-custom-teal-500">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.8534088865276!2d121.51685122061681!3d25.039048402679413!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442a975c13ae63d%3A0x99f529730969be7f!2z6LKh5ZyY5rOV5Lq65by15qau55m85Z-66YeR5pyD!5e0!3m2!1szh-TW!2stw!4v1684658779278!5m2!1szh-TW!2stw" width="100%" height="100%" class="border-r border-l border-custom-teal-500 h-422 md:h-250 mb-5" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            <div class="flex items-center ml-4 mb-4">
              <div class="w-10 h-10 mr-2" :class="{
              'carIcon': currentTrafficInfo.transportation === 'car', 
              'MRTIcon': currentTrafficInfo.transportation === 'MRT', 'busIcon': currentTrafficInfo.transportation === 'bus'}"></div>
              <p class="text-custom-teal-500">{{ currentTrafficInfo.method }}</p>
            </div>
            <ul class="ml-11 mb-4">
              <li v-for="item in  currentTrafficInfo.info" :key="item" class="text-white list-disc" >{{ item }}</li>
            </ul>
          </div>
        </div>

      </div>
      <!-- 第五區塊結束 -->

      <!-- 第六區塊開始 -->
      <div ref="section6" class="h-screen">
        <p class="text-white">section6</p>
      </div>
      <!-- 第六區塊結束 -->
    </div>
      
    <div class="hidden md:block logoTxt w-138 h-9 fixed top-6 left-6" v-if="currentSpiderNum !== 1"></div>
    <div class="hidden md:block fixed bottom-6 left-6" v-if="currentSpiderNum !== 1">
      <div class="fbIcon w-6 h-6 bg-cover"></div>
      <div class="my-2 mx-2 w-0.5 h-10 bg-custom-teal-500"></div>
      <p class="writing-vertical text-custom-teal-500 text-sm">Webconf 2023 All Rights Reserved.</p>
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
.locationIcon {
  background-image: url('src/assets/images/icon/ic_location_s.svg');
}
.carIcon {
  background-image: url('src/assets/images/icon/ic_byCar_l.svg');
}
.MRTIcon {
  background-image: url('src/assets/images/icon/ic_byMRT_l.svg');
}
.busIcon {
  background-image: url('src/assets/images/icon/ic_byBus_l.svg');
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
import { ref, onMounted, inject, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useScrollStore } from '@/stores/scroll';
import { speakers } from '@/content/speakers';
import { trafficInfo } from '@/content/trafficInfo';

const scrollStore = useScrollStore();
const { currentSpiderNum, isClicking } = storeToRefs(scrollStore);
const { setSpiderLocation } = scrollStore
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
const bannerText = ref(null);
const sellBtn = ref(null);

const speaker1 = ref();
const speaker2 = ref();
const currentTrafficInfo = ref({
  transportation: "car",
  method: "開車",
  info: trafficInfo.car,
});

const toggleTrafficInfo = (transportation, method) => {
  currentTrafficInfo.value = {
    transportation,
    method,
    info: trafficInfo[transportation],
  }
};


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


watch(currentSpiderNum, (newValue) => {
  scrollIntoView(newValue);
});

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
function updateLoading() {
  gsap.to(loadingAnime.value, { y: -initHeight, duration: 1 });
  gsap.to(loadingLine.value, { height: 10, duration: 1 });
  setTimeout(() => {
    loadingPercent.value = 100;
  }, 800)
}

const handleScroll = () => {
  if (isClicking.value) {
    // 若正在點擊操作中，則不處理滾輪事件
    return;
  }
  // 根據滾輪位置偵測區塊
  const sections = [
    section1,
    section2,
    section3,
    section4,
    section5,
    section6,
  ];

  let currentSectionIndex = -1;

  for (let i = sections.length - 1; i >= 0; i--) {
    if (sections[i].value.getBoundingClientRect().top <= window.innerHeight / 2) {
      currentSectionIndex = i + 1;
      break;
    }
  }

  // 執行 setSpiderLocation()，傳遞當前區塊的索引
  setSpiderLocation(currentSectionIndex);
};

onMounted(() => {
  // 計算蜘蛛圖片距離視窗最上方的距離
  calculateSpiderTop();

  // 模擬載入過程
  showHome.value = true;
  setTimeout(() => {
    updateLoading()
    setSpiderLocation(1);
    setTimeout(() => {
      showHomePage();
    }, 1000)
  }, 100)

  window.addEventListener('scroll', handleScroll);
  speaker1.value = speakers.speaker1;
  speaker2.value = speakers.speaker2;

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

// defineExpose({
//   scrollIntoView,
// })
</script>
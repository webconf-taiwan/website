<template>
<!-- loading 畫面 -->
  <div ref="loading" v-if="loading" class="fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-custom-gray-900 z-50">
    <div ref="loadingLine" class="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-custom-teal-500" :style="{ height: `${spiderTop + 20}px` }"></div>
    <div ref="loadingAnime" class="flex flex-col items-center">
      <img src="@/assets/images/spider.svg" class="h-16 mb-2" alt="loading spider" style="transform: rotate(180deg)" ref="spider" />
        <div class="font-medium text-sm text-custom-teal-500">{{ loadingPercent }}%</div>
      </div>
  </div>
<!-- 首頁 -->

<div v-if="showHome" class="mainWidth">
<!-- <div class="bgImage w-screen h-screen bg-no-repeat bg-center bg-fixed bg-cover"></div> -->
  
    <div class="flex flex-col relative bg-transparent">
      <!-- 第一區塊開始 -->
      <div ref="section1">
        <div ref="banner" class="mainWidth h-[85vh] md:h-screen flex flex-col justify-center items-center w-full">
          <div class=" logoM w-60 sm:w-1/2 h-3/4 md:w-full md:h-screen bg-contain bg-no-repeat bg-center flex flex-col justify-between items-center md:items-stretch relative">
            <div class="titleBanner w-340 h-80 md:w-480 md:h-110 bg-cover bg-no-repeat bg-center mt-4 md:mt-14 md:ml-28 absolute left-1/2 top-[-5%] transform -translate-x-1/2 md:left-60 md:top-6"></div>
            <div class="logoS w-[350px] h-[380px]  bg-cover absolute top-14   "></div>
            <div class="absolute left-1/2 bottom-[-10%] transform -translate-x-1/2 md:left-3/4 md:bottom-32 lg:bottom-16">
              <div class="flex flex-col md:flex-row items-center justify-end md:mr-20 lg:mr-44">
                <p ref="bannerText" class="whitespace-nowrap text-white text-center md:text-right font-rajdhani font-normal text-lg md:mr-3 mb-5 md:mb-0">In 2023, Webconf Is Happening<br/>Again After Ten Years. </p>
                <button class="whitespace-nowrap border-2 border-custom-teal-500 text-custom-teal-700 bg-custom-gray-900 px-10 py-2 font-noto-sans font-medium text-lg cursor-not-allowed">即將開賣</button>

                <!-- 購票按鈕 -->
                <!-- <a href="#" class="whitespace-nowrap border-2 border-custom-teal-500 text-custom-gray-800 bg-custom-teal-500 px-10 py-2 font-noto-sans font-medium text-lg">前往購票</a> -->
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 第一區塊結束 -->

      <!-- 第二區塊開始 -->
      <div ref="section2" class="relative mx-6 md:mx-24 lg:ml-32 lg:mr-60 my-6 md:my-0 md:py-40  lg:pt-16 bg-transparent 2xl:m-auto 2xl:w-[45vw]">
          <div class="flex flex-col md:flex-row-reverse items-end md:items-center md:justify-end">
            <div class="titleDecoration w-20 h-6"></div>
            <div class="text-center bg-custom-gray-800 border border-custom-teal-500 py-2 px-5 w-full md:w-436 md:mr-2 mt-1 md:mt-0">
              <h1 class="text-custom-teal-500 font-normal text-4xl whitespace-nowrap font-rajdhani">WebConf Taiwan
              </h1>
            </div>
          </div>
          
          <div class="py-1 flex items-center border border-custom-teal-500 bg-custom-gray-800">
            <div class="border-b border-t border-r border-custom-teal-700 w-8 mt-1 mb-1 mr-2">
              <div class="my-1 border-b border-t border-custom-teal-700 h-6px"></div>
            </div>
            <p class="text-base font-medium text-custom-pink-700 whitespace-nowrap font-rajdhani">BACK TO THE FUTURE OF WEBCONF.
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
          <div class="scrollbar bg-black border-b border-r border-l border-custom-teal-500 py-5 px-3 md:border-t md:absolute md:right-[-10%] lg:right-[-13%] xl:right-[-10%] md:bottom-[-30%] lg:bottom-[-40%] md:h-200 md:w-300  lg:w-480 xl:w-588 3xl:w-[660px] md:overflow-y-auto md:transform md:-translate-y-1/2 ">
            <p class="mb-6 text-white text-base font-normal">在 <span class="font-rajdhani"> 2023
              </span> 年重啟十年前的 <span class="font-rajdhani"> WebConf
              </span> 研討會中，帶領與會者穿越時間，探索網路的過去、現在和未來。過去十年間，網路發生了巨大的變化，我們將重新審視網路的起源以及它在這些年裡的演進。</p>
            <p class="mb-6 text-white text-base font-normal"><span class="font-rajdhani"> WebConf
              </span> 不僅僅關注過去，還關注網頁的未來趨勢和新興技術，並提供業界趨勢及發展方向，以協助企業更好地了解未來網頁發展的方向。從人工智慧和機器學習的興起，到行動優化和響應式設計的重要性不斷提高，這個研討會將深入探討網頁開發的未來和企業如何在網頁技術的快速變化中保持競爭優勢。</p>
            <p class="text-white text-base font-normal">我們誠摯地邀請您加入我們，一起穿越時空，探索網頁技術的進，並了解未來十年網頁發展的趨勢。</p>
          </div>
        </div>

        <div class="logoMan hidden md:block md:w-300 md:h-370 md:bg-cover md:absolute md:top-0 md:right-[-15%] lg:right-[-18%] xl:right-[-14%]">
        </div>
      </div>
      <!-- 第二區塊結束 -->

      <!-- 第三區塊開始 -->
      <div ref="section3" class="section3 md:h-[200vh] relative py-6 px-5">
        <div class="flex flex-col items-end mt-10">
          <div class="titleDecoration w-20 h-6"></div>
            <div class="text-center bg-custom-gray-800 border border-custom-teal-500 py-2 px-5 mt-1">
              <h2 class="text-custom-teal-500 font-medium text-3xl whitespace-nowrap md:text-5xl">講者曝光
              </h2>
          </div>
        </div>
        <div class="overflow-hidden">

          <div id="speaker" class="md:absolute md:transform md:-translate-x-1/2 md:top-60 md:right-0">
            <div ref="logoMan3" class="logoMan hidden md:block md:w-213 md:h-263 md:bg-cover md:absolute md:transform md:-translate-x-1/2 md:top-6 md:right-0 lg:right-[-10px]">
            </div>

            <div class="flex justify-around md:flex-col mt-10 md:absolute md:transform md:-translate-x-1/2 md:right-[-450px] lg:right-[-500px]">
            <ul class="flex flex-col md:flex-row-reverse md:mb-4 md:mr-20">
              <li class="flex-shrink-0 mb-4 md:mb-0 md:ml-10" v-for="(item, index) in speaker1" :key="item.mainName">
                <p class="bg-custom-gray-800 text-custom-teal-500 p-1 border-t border-l border-r border-custom-teal-500 text-xl font-medium md:w-40 md:ml-43" :class="{'font-rajdhani': item.mainIsEn}">{{ item.mainName }} <span class=" text-sm font-medium" :class="{'font-rajdhani': item.secondaryIsEn}" v-if="item.secondaryName">({{ item.secondaryName }})</span></p>
                <div class="md:flex">
                  <div class="hidden md:block border-b border-l border-t border-custom-teal-500 bg-custom-gray-800 px-2">
                    <div class="h-5 border-r border-l border-b border-custom-teal-700 mx-1 mb-3">
                      <div class="w-7px h-5 border-r border-l border-custom-teal-700 mx-1"></div>
                    </div>
                    <p class="writing-vertical text-custom-pink-700 text-lg font-normal leading-tight mb-3 font-rajdhani">SPEAKER</p>
                    <div class="h-105 border-r border-l border-t border-custom-teal-700 mx-1">
                      <div class="w-7px h-105 border-r border-l border-custom-teal-700 mx-1"></div>
                    </div>
                  </div>
                  <div class="border border-custom-teal-500 p-1 bg-custom-gray-800">
                    <img class="w-145 h-148 sm:w-202 sm:h-206 md:hidden" :src="item.speaker" alt="speaker">
                    <img :id="item.id" class="w-145 h-148 sm:w-202 sm:h-206 hidden md:block" :src="item.speaker" alt="speaker" :style="{ opacity: 1 - (index / speaker2.length) }">
                  </div>
                </div>
                
              </li>
            </ul>
            <ul class="flex flex-col md:flex-row-reverse mt-10 md:mt-0">
              <li class="flex-shrink-0 mb-4 md:mb-0 md:ml-10 md:flex md:flex-col-reverse" v-for="(item, index) in speaker2" :key="item.mainName">
                <p class="bg-custom-gray-800 text-custom-teal-500 p-1 border-t border-l border-r md:border-b md:border-t-0 border-custom-teal-500 text-xl font-medium md:w-40 md:ml-43" :class="{'font-rajdhani': item.mainIsEn}">{{ item.mainName }} <span class="text-sm font-medium" :class="{'font-rajdhani': item.secondaryIsEn}" v-if="item.secondaryName">({{ item.secondaryName }})</span></p>
                <div class="md:flex">
                  <div class="hidden md:block border-b border-l border-t border-custom-teal-500 bg-custom-gray-800 px-2">
                    <div class="h-5 border-r border-l border-b border-custom-teal-700 mx-1 mb-3">
                      <div class="w-7px h-5 border-r border-l border-custom-teal-700 mx-1"></div>
                    </div>
                    <p class="writing-vertical text-custom-pink-700 text-lg font-normal leading-tight mb-3 font-rajdhani">SPEAKER</p>
                    <div class="h-105 border-r border-l border-t border-custom-teal-700 mx-1">
                      <div class="w-7px h-105 border-r border-l border-custom-teal-700 mx-1"></div>
                    </div>
                  </div>
                  <div class="border border-custom-teal-500 p-1 bg-custom-gray-800">
                    <img class="w-145 h-148 sm:w-202 sm:h-206 md:hidden" :src="item.speaker" alt="speaker">
                    <img :id="item.id" class="w-145 h-148 sm:w-202 sm:h-206 hidden md:block" :src="item.speaker" alt="speaker" :style="{ opacity: 1 - (index / speaker2.length) }">
                  </div>
                </div>
              </li>
            </ul>
          </div>
          </div>
        </div>
      </div>
      <!-- 第三區塊結束 -->

      <!-- 第四區塊開始 -->
      <div ref="section4" id="section4Trigger" class="md:h-[80vh] 3xl:h-[60vh] relative py-6 px-5 overflow-hidden 2xl:w-[75vw] 2xl:mx-auto">
        <div class="logoMan hidden md:block md:w-[230px] md:h-[280px] md:bg-cover md:absolute md:z-20 md:transform md:-translate-x-1/2 md:top-32 md:right-[-20px]"></div>
        
        <div class="flex flex-col items-end mb-8">
          <div class="titleDecoration w-20 h-6"></div>
            <div class="text-center bg-custom-gray-800 border border-custom-teal-500 py-2 px-5 mt-1">
              <h2 class="text-custom-teal-500 font-medium text-3xl whitespace-nowrap md:text-5xl">議程主軸
              </h2>
          </div>
        </div>

        <div class="md:absolute md:top-32  md:left-1 lg:left-[15%]">
          <div class="relative w-335 md:w-374 h-64 mx-auto mb-14">
          <div class="absolute z-10">
            <h3 class="font-rajdhani font-normal text-2xl md:text-56 bg-custom-gray-800 text-custom-teal-500 border-t border-r border-l border-custom-teal-500 w-75 md:w-157 text-center py-3 md:py-4">Web</h3>

            <div class="py-1 border border-custom-teal-500 bg-custom-gray-800 flex">
              <div class="w-5 border-t border-b border-r border-custom-teal-700 my-1 py-1">
                <div class="h-6px border-t border-b border-custom-teal-700"></div>
              </div>
              <p class="font-rajdhani text-custom-pink-700 font-medium mx-3">WEB DEVELOPMENT</p>
              <div class="border-t border-b border-l border-custom-teal-700 my-1 py-1 flex-grow">
                <div class="h-6px border-t border-b border-custom-teal-700"></div>
              </div>
            </div>

            <div class="py-4 px-3 md:p-8 bg-custom-gray-800 border-custom-teal-500 border-b border-r border-l">
              <p class="font-normal text-white">
              包含 <span class="font-rajdhani"> Frontend
              </span> 、<span class="font-rajdhani"> Backend
              </span>、<span class="font-rajdhani"> DevOps
              </span>、技術管理等相關議題。將深入探討各種 <span class="font-rajdhani"> Web
              </span> 技術的最新趨勢、過往發展，以及如何透過這些技術來提升網站或應用程式的品質、效能與安全性。
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
            <h3 class="font-rajdhani font-normal text-2xl md:text-56 bg-custom-gray-800 text-custom-teal-500 border-t border-r border-l border-custom-teal-500 w-75 md:w-157 text-center py-3 md:py-4">UI/UX</h3>

            <div class="py-1 border border-custom-teal-500 bg-custom-gray-800 flex">
              <div class="w-5 border-t border-b border-r border-custom-teal-700 my-1 py-1">
                <div class="h-6px border-t border-b border-custom-teal-700"></div>
              </div>
              <p class="font-rajdhani text-custom-pink-700 font-medium mx-3">UI/UX DESIGN</p>
              <div class="border-t border-b border-l border-custom-teal-700 my-1 py-1 flex-grow">
                <div class="h-6px border-t border-b border-custom-teal-700"></div>
              </div>
            </div>

            <div class="py-4 px-3 md:p-8 bg-custom-gray-800 border-custom-teal-500 border-b border-r border-l">
              <p class=" font-normal text-white">
              本屆科技年會將探討 <span class="font-rajdhani"> UI/UX
              </span> 設計的最新趨勢，包括使用者界面設計、使用者體驗優化、人機互動設計等議題，以深入探討如何打造出引人入勝的用戶體驗，提升產品的價值和競爭力。
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
      <div ref="section5" class="relative py-6 px-5 overflow-hidden 2xl:w-[75vw] 2xl:mx-auto">
        <div class="flex flex-col items-end mb-8 md:mb-0">
          <div class="titleDecoration w-20 h-6"></div>
            <div class="text-center bg-custom-gray-800 border border-custom-teal-500 py-2 px-5 mt-1">
              <h2 class="text-custom-teal-500 font-medium text-3xl whitespace-nowrap md:text-5xl">交通資訊
              </h2>
          </div>
        </div>

        <div class="mb-5 md:mb-0 md:flex md:items-end md:ml-79 lg:ml-167 xl:ml-20">
          <h4 class="text-32 leading-normal font-medium text-custom-teal-500 py-2 md:py-1 bg-custom-gray-800 border md:border-b-0 border-custom-teal-500 text-center md:w-340">張榮發國際會議中心</h4>
          <div class="flex bg-custom-gray-800 justify-center items-center border-b md:border-b-0 border-r border-l md:border-l-0 md:border-t border-custom-teal-500 py-2 w-253 md:w-267 md:h-10">
            <div class="locationIcon w-5 h-5 mr-2"></div>
            <p class="text-white text-sm leading-normal font-normal"><span class="font-rajdhani"> 100
              </span> 台北市中正區中山南路 <span class="font-rajdhani"> 11
              </span> 號</p>
          </div>
        </div>

        <div class="md:flex md:ml-10 lg:ml-32 xl:ml-20 relative z-20">
          <ul class="flex justify-between md:flex-col">
            <li class="writing-vertical border border-custom-teal-500 bg-custom-gray-800 flex-1">
              <a href="#" class="block font-rajdhani text-lg text-custom-pink-700 opacity-40" :class="{'opacity-100': currentTrafficInfo.transportation === 'car'}" @click.prevent="toggleTrafficInfo('car', '開車')">
                <div class="flex justify-between py-1 md:py-0 md:px-1">
                  <div class="flex-1 md:h-5 my-1.5 md:my-0 md:mx-1.5 py-1 md:py-0 md:px-1 border-t md:border-t-0  border-b border-r md:border-l border-custom-teal-700" :class="{'border-color-teal': currentTrafficInfo.transportation === 'car'}">
                    <div class="border-t md:border-t-0 border-b md:border-b-0 border-l border-r border-custom-teal-700 h-6px md:h-full md:w-2" :class="{'border-color-teal': currentTrafficInfo.transportation === 'car'}"></div>
                  </div>
                  <p class="mx-2 md:mx-0 md:my-2">BY CAR</p>
                  <div class="flex-1 my-1.5 md:my-0 md:mx-1.5 py-1 md:py-0 md:px-1 border-t border-b md:border-b-0 border-l md:border-r border-custom-teal-700" :class="{'border-color-teal': currentTrafficInfo.transportation === 'car'}">
                    <div class="border-t md:border-t-0 border-b md:border-b-0 md:border-l md:border-r border-custom-teal-700 h-6px md:h-full md:w-2" :class="{'border-color-teal': currentTrafficInfo.transportation === 'car'}"></div>
                  </div>
                </div>
                </a>
            </li>
            <li class="writing-vertical border border-custom-teal-500 bg-custom-gray-800 flex-1">
              <a href="#" class="block font-rajdhani text-lg text-custom-pink-700 opacity-40" :class="{'opacity-100': currentTrafficInfo.transportation === 'MRT'}" @click.prevent="toggleTrafficInfo('MRT', '搭捷運')">
                <div class="flex justify-between py-1 md:py-0 md:px-1">
                  <div class="flex-1 md:h-5 my-1.5 md:my-0 md:mx-1.5 py-1 md:py-0 md:px-1 border-t md:border-t-0  border-b border-r md:border-l border-custom-teal-700" :class="{'border-color-teal': currentTrafficInfo.transportation === 'MRT'}">
                    <div class="border-t md:border-t-0 border-b md:border-b-0 border-l border-r border-custom-teal-700 h-6px md:h-full md:w-2" :class="{'border-color-teal': currentTrafficInfo.transportation === 'MRT'}"></div>
                  </div>
                  <p class="mx-2 md:mx-0 md:my-2">BY MRT</p>
                  <div class="flex-1 my-1.5 md:my-0 md:mx-1.5 py-1 md:py-0 md:px-1 border-t border-b md:border-b-0 border-l md:border-r border-custom-teal-700" :class="{'border-color-teal': currentTrafficInfo.transportation === 'MRT'}">
                    <div class="border-t md:border-t-0 border-b md:border-b-0 md:border-l md:border-r border-custom-teal-700 h-6px md:h-full md:w-2" :class="{'border-color-teal': currentTrafficInfo.transportation === 'MRT'}"></div>
                  </div>
                </div>
                </a>
            </li>
            <li class="writing-vertical border border-custom-teal-500 bg-custom-gray-800 flex-1">
              <a href="#" class="block font-rajdhani text-lg text-custom-pink-700 opacity-40" :class="{'opacity-100': currentTrafficInfo.transportation === 'bus'}" @click.prevent="toggleTrafficInfo('bus', '搭公車')">
                <div class="flex justify-between py-1 md:py-0 md:px-1">
                  <div class="flex-1 md:h-5 my-1.5 md:my-0 md:mx-1.5 py-1 md:py-0 md:px-1 border-t md:border-t-0  border-b border-r md:border-l border-custom-teal-700" :class="{'border-color-teal': currentTrafficInfo.transportation === 'bus'}">
                    <div class="border-t md:border-t-0 border-b md:border-b-0 border-l border-r border-custom-teal-700 h-6px md:h-full md:w-2" :class="{'border-color-teal': currentTrafficInfo.transportation === 'bus'}"></div>
                  </div>
                  <p class="mx-2 md:mx-0 md:my-2">BY BUS</p>
                  <div class="flex-1 my-1.5 md:my-0 md:mx-1.5 py-1 md:py-0 md:px-1 border-t border-b md:border-b-0 border-l md:border-r border-custom-teal-700" :class="{'border-color-teal': currentTrafficInfo.transportation === 'bus'}">
                    <div class="border-t md:border-t-0 border-b md:border-b-0 md:border-l md:border-r border-custom-teal-700 h-6px md:h-full md:w-2" :class="{'border-color-teal': currentTrafficInfo.transportation === 'bus'}"></div>
                  </div>
                </div>
                </a>
            </li>
          </ul>

          <div class="bg-custom-gray-800 border border-custom-teal-500 md:w-762 md:h-460 md:p-3">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.8534088865276!2d121.51685122061681!3d25.039048402679413!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442a975c13ae63d%3A0x99f529730969be7f!2z6LKh5ZyY5rOV5Lq65by15qau55m85Z-66YeR5pyD!5e0!3m2!1szh-TW!2stw!4v1684658779278!5m2!1szh-TW!2stw" width="100%" height="100%" class="border-r border-l border-custom-teal-500 h-[200px] md:h-250 mb-5" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            <div class="flex items-center ml-4 mb-4">
              <div class="w-10 h-10 mr-2" :class="{
              'carIcon': currentTrafficInfo.transportation === 'car', 
              'MRTIcon': currentTrafficInfo.transportation === 'MRT', 'busIcon': currentTrafficInfo.transportation === 'bus'}"></div>
              <p class="text-custom-teal-500 text-lg md:text-xl font-medium">{{ currentTrafficInfo.method }}</p>
            </div>
            <ul class="ml-11 mr-5 mb-4 md:mb-0">
              <li v-for="item in  currentTrafficInfo.info" :key="item" class="text-white list-disc" >{{ item }}</li>
            </ul>
          </div>
        </div>

        <div class="logoMan hidden xl:block w-370 h-456 bg-cover absolute top-36 right-0 z-0">
          <div ref="car" class="carImage hidden xl:block w-[330px] h-[175px] bg-cover absolute top-72 right-[200%] 3xl:right-[300%] z-10"></div>
          <div ref="MRT" class="MRTImage hidden xl:block w-[330px] h-[180px] bg-cover absolute top-72 right-[200%] 3xl:right-[300%] z-10"></div>
          <div ref="bus" class="busImage hidden xl:block w-[330px] h-[180px] bg-cover absolute top-72 right-[200%] 3xl:right-[300%] z-10"></div>
        </div>
      </div>
      <!-- 第五區塊結束 -->

      <!-- 第六區塊開始 -->
      <div ref="section6" class="relative py-20 overflow-hidden flex justify-center items-center">
        <div class="flex flex-col items-center">
          <div class="logoSpider bg-cover mb-4 md:relative w-335 h-180 sm:w-374 sm:h-52 md:w-660 md:h-350">
            <div class="join bg-cover hidden md:block md:w-90 md:h-90 md:absolute md:left-16 md:top-20"></div>
          </div>
          <div class="timeAdd bg-cover w-300 h-14 md:w-588 md:h-8 mb-7 "></div>
          <button class="whitespace-nowrap border-2 border-custom-teal-500 text-custom-teal-700 bg-custom-gray-900 px-10 py-2 font-noto-sans font-medium text-lg cursor-not-allowed mb-4">即將開賣</button>

          <!-- 購票按鈕 -->
          <!-- <a href="#" class="whitespace-nowrap border-2 border-custom-teal-500 text-custom-gray-800 bg-custom-teal-500 px-10 py-2 font-noto-sans font-medium text-lg mb-4">前往購票</a> -->

          <a href="https://www.facebook.com/WebConfTaiwan" target="_blank" class="text-sm font-normal text-white">敬請關注 Facebook 最新消息</a>
        </div>
      </div>
      <!-- 第六區塊結束 -->
    </div>
      
    <div class="hidden md:block logoTxt w-138 h-9 fixed top-6 left-6 z-30" v-if="currentSpiderNum !== 1"></div>
    <div class="hidden md:block fixed bottom-6 left-6 z-30" v-if="currentSpiderNum !== 1 && currentSpiderNum !== 6">
      <div class="flex flex-col justify-center items-center">
        <a href="https://www.facebook.com/WebConfTaiwan" target="_blank">
          <div class="fbIcon w-6 h-6 bg-cover"></div>
        </a>
        <div class="m-2 w-0.5 h-10 bg-custom-teal-500"></div>
        <p class="writing-vertical text-custom-teal-500 text-sm font-rajdhani">Webconf 2023 All Rights Reserved.</p>
      </div>
    </div>

    <!-- 首頁尾巴 -->
  </div>
  
</template>

<style scoped>
/* 手機版 */
.bgImage {
  background-image: url('@/assets/images/bg_m.png');
}
.logo {
  background-image: url('@/assets/images/logo_all_m.png');
}
.logoS {
  background-image: url('@/assets/images/logo_all_m.png');
}
.titleBanner {
  background-image: url('@/assets/images/title_banner.svg');
}
.mainWidth {
  width: 100vw;
}
.titleDecoration {
  background: url('@/assets/images/title_display.svg') no-repeat;
}
.photo1 {
  background-image: url('@/assets/images/photo_1.png');
}
.photo2 {
  background-image: url('@/assets/images/photo_2.png');
}
.fixed-width {
  flex-shrink: 0;
  flex-basis: 701px;
}
.logoMan {
  background-image: url('@/assets/images/logo_man.png');
}
.locationIcon {
  background-image: url('@/assets/images/icon/ic_location_s.svg');
}
.carIcon {
  background-image: url('@/assets/images/icon/ic_byCar_l.svg');
}
.MRTIcon {
  background-image: url('@/assets/images/icon/ic_byMRT_l.svg');
}
.busIcon {
  background-image: url('@/assets/images/icon/ic_byBus_l.svg');
}

.carImage {
  background-image: url('@/assets/images/traffic_car.png');
}
.MRTImage {
  background-image: url('@/assets/images/traffic_mrt.png');
}
.busImage {
  background-image: url('@/assets/images/traffic_bus.png');
}

.logoSpider {
  background-image: url('@/assets/images/logo_spider.png');
}

.timeAdd {
  background-image: url('@/assets/images/time_add_m.svg');
}

.join {
  background-image: url('@/assets/images/join.svg');
}

.opacity-40.opacity-100 {
  opacity: 1;
}

.border-color-teal {
  border-color: #3EF0FC;
}

@media (min-width: 768px) {
  .bgImage {
  background-image: url('@/assets/images/bg.png');
  }
  .logo {
    background-image: url('@/assets/images/logo_all.png');
  }
  .logoS {
  background-image: none;
  }
  .logoM {
    background-image: url('@/assets/images/logo_all.png');
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
    background-image: url('@/assets/images/logo_txt.svg');
  }
  .writing-vertical {
    writing-mode: vertical-rl;
  }
  .fbIcon {
    background-image: url('@/assets/images/icon/ic_fb_l.svg');
  }

  .timeAdd {
    background-image: url('@/assets/images/time_add.svg');
  }
}

</style>


<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useScrollStore } from '@/stores/scroll';
import { usePageInfoStore } from '@/stores/pageInfo';
import { speakers } from '@/content/speakers';
import { trafficInfo } from '@/content/trafficInfo';

const route = useRoute(); // 取得路由資訊

const scrollStore = useScrollStore();
const { currentSpiderNum, isClicking, scrollIntoViewFn, toggleSpiderLineHeightFn } = storeToRefs(scrollStore);
const { setSpiderLocation } = scrollStore

const pageInfoStore = usePageInfoStore();
const { setCurrentPageName } = pageInfoStore;

const gsap = inject('gsap');
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const showHome = ref(false);
const section1 = ref();
const section2 = ref();
const section3 = ref();
const section4 = ref();
const section5 = ref();
const section6 = ref();

const banner = ref(null);
const bannerText = ref(null);
const sellBtn = ref(null);

const logoMan3 = ref();
const speaker1 = ref();
const speaker2 = ref();
const car = ref();
const MRT = ref();
const bus = ref();
const currentTrafficInfo = ref({
  transportation: "car",
  method: "開車",
  info: trafficInfo.car,
});
let currentTransportation = null;
let previousTransportation = null;
let speakerMoveRightTl = null;

const toggleTrafficInfo = (transportation, method, isFirst) => {
  previousTransportation = currentTransportation;
  currentTransportation = transportation;

  if (previousTransportation === transportation) return;

  currentTrafficInfo.value = {
    transportation,
    method,
    info: trafficInfo[transportation],
  };
   
  const refName = `${transportation}.value`;
  const refValue = eval(refName);
  gsap.to(refValue, {
    top: '19rem',
    right: '1rem',
    duration: 0.5,
    ease: 'power2.out',
  });

  if (!isFirst) {
    const previousRefName = `${previousTransportation}.value`;
    const previousRefValue = eval(previousRefName);
    gsap.to(previousRefValue, {
      right: '-30rem',
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
      moveBack(previousRefValue);
      },
    });
  }

};

const moveBack = (previousRefValue) => {
  const viewportWidth = window.innerWidth;
  if (viewportWidth >= 2000) {
    gsap.set(previousRefValue, { right: '300%' });
  } else {
    gsap.set(previousRefValue, { right: '200%' });
  }
  
};

const showHomePage = () => {
  gsap.to(loading.value, { autoAlpha: 0, duration: 0.5 });
  section1Anime();
  toggleTrafficInfo('car', '開車', true);
}

const section1AnimeTl = gsap.timeline();
const section1LeaveAnimeTl = gsap.timeline();

const section1Anime = () => {
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

const section1LeaveAnime = () => {
section1LeaveAnimeTl.to(section1.value, { xPercent: 100, opacity: 0, duration: 1 })
section1LeaveAnimeTl.to(section1.value, { xPercent: 0, opacity: 0, duration: 0.2 })
// section1LeaveAnimeTl.to(section1.value, { height: '10px', duration: 0.2 })
}

const section3Anime = () => {
  setTimeout(() => {
    speakerMoveRightTl = gsap.timeline({
      scrollTrigger: {
        trigger: section3.value,
        start: 'top+=60',
        endTrigger: section4.value,
        end: 'top bottom',
        pin: true,
        // markers: true,
        scrub: true,
        onUpdate: () => {},
      },
    });

    const speaker = document.getElementById('speaker');
    const speaker1 = document.getElementById('speaker1-1');
    const speaker2 = document.getElementById('speaker1-2');
    const speaker3 = document.getElementById('speaker1-3');
    const speaker4 = document.getElementById('speaker1-4');
    const speaker5 = document.getElementById('speaker1-5');
    const speaker6 = document.getElementById('speaker2-1');
    const speaker7 = document.getElementById('speaker2-2');
    const speaker8 = document.getElementById('speaker2-3');
    const speaker9 = document.getElementById('speaker2-4');
    const speaker10 = document.getElementById('speaker2-5');
   
    speakerMoveRightTl.to(speaker, {
      x: 345,
    });
    speakerMoveRightTl.to([speaker1, speaker6], {
      opacity: 1,
    });
    speakerMoveRightTl.to([speaker2, speaker7], {
      opacity: 1,
    });
    speakerMoveRightTl.to([speaker3, speaker8], {
      opacity: 1,
    });

    speakerMoveRightTl.to(speaker, {
      x: 690,
    });
    speakerMoveRightTl.to([speaker4, speaker9], {
      opacity: 1,
    });
    speakerMoveRightTl.to([speaker5, speaker10], {
      opacity: 1,
    });

    speakerMoveRightTl.to(speaker, {
      x: 1035,
    });

    speakerMoveRightTl.to(speaker, {
      x: 1380,
    });

    speakerMoveRightTl.to(speaker, {
      x: 1725,
    });

    speakerMoveRightTl.to(speaker, {
      x: 2070,
    });
  });
}

const scrollIntoView = (num) => {
  const section1Height = section1.value.offsetHeight;
  const section2Height = section2.value.offsetHeight;
  const scrollPosition = section1Height + section2Height - 50;
  switch (num) {
    case 1:
      section1.value.scrollIntoView({ behavior: 'smooth' });
      break;
    case 2:
      section2.value.scrollIntoView({ behavior: 'smooth' });
      break;
    case 3:
      window.scrollTo({ top: scrollPosition, behavior: 'smooth'});
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
const loading =  ref(true);
const loadingAnime = ref();
const loadingLine = ref();
const spider = ref();
const loadingPercent = ref(0);
const spiderTop = ref();
let initHeight;

// 計算蜘蛛圖片距離視窗最上方的距離
function calculateSpiderTop() {
  const spiderRect = spider.value.getBoundingClientRect();
  spiderTop.value = spiderRect.top + window.pageYOffset;
  if (!initHeight) {
    initHeight = spiderTop.value;
  }
}

// 更新 loading 畫面的百分比和線條高度
function updateLoading() {
  gsap.to(loadingAnime.value, { y: -initHeight, duration: 1 });
  gsap.to(loadingLine.value, { height: 10, duration: 1 });
  setTimeout(() => {
    loadingPercent.value = 100;
  }, 800)

  setTimeout(() => {
    loading.value = false;
  }, 1000)
}

const handleScroll = async() => {
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

  let scrollTimeout = null; 

  clearTimeout(scrollTimeout);

  scrollTimeout = setTimeout(() => {
    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i].value.getBoundingClientRect().top <= window.innerHeight / 2) {
        currentSectionIndex = i + 1;
        break;
      }
    }

    // 執行 setSpiderLocation()，傳遞當前區塊的索引
    setSpiderLocation(currentSectionIndex);
    toggleSpiderLineHeightFn.value(currentSectionIndex);
  }, 500)
};

onMounted(() => {
  // 計算蜘蛛圖片距離視窗最上方的距離
  calculateSpiderTop();

  // 模擬載入過程
  showHome.value = true;
  setTimeout(() => {
    updateLoading()
    setSpiderLocation(1, true);
    setTimeout(() => {
      showHomePage();
    }, 1000)
  }, 100)

  // 設定當前路由名稱
  setCurrentPageName(route.name);

  scrollIntoViewFn.value = scrollIntoView;
  
  speaker1.value = speakers.speaker1;
  speaker2.value = speakers.speaker2;

  setTimeout(() => {
    const viewportWidth = window.innerWidth;
    if (viewportWidth >= 768) {
      window.addEventListener('scroll', handleScroll);
      section3Anime();
    }
  })

  // const a = ScrollTrigger.create({
  //   trigger: section3.value,
  //   start: 'top center',
  //   end: 'bottom center',
  //   scrub: true,
  //   pin: ".pin",
  //   // pin: true, // 新增 pin 屬性
  //   anticipatePin: 1,
  //   onUpdate: (self) => {
  //     const progress = self.progress;
  //     const distanceToMove = 100; // 要移動的距離

  //     // 根據滾動進度計算移動距離
  //     const moveDistance = distanceToMove * progress;

  //     // 移動 div
  //     gsap.set(section3.value, { x: moveDistance });
  //   },
  // });

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
  // scrollIntoView,
})
</script>
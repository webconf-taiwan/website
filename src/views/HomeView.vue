<template>
  <!-- loading 畫面 -->
  <div
    ref="loading"
    class="fixed top-0 left-0 z-50 flex items-center justify-center w-screen h-screen bg-custom-gray-900"
  >
    <div
      ref="loadingLine"
      class="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-custom-teal-500"
      :style="{ height: `${spiderTop + 20}px` }"
    ></div>
    <div ref="loadingAnime" class="flex flex-col items-center">
      <img
        src="@/assets/images/spider.svg?url"
        class="h-16 mb-2"
        alt="loading spider"
        style="transform: rotate(180deg)"
        ref="spider"
      />
      <div class="text-sm font-medium text-custom-teal-500">{{ loadingPercent }}%</div>
    </div>
  </div>
  <!-- 首頁 -->

  <div v-if="showHome" class="mainWidth">
    <div class="relative flex flex-col bg-transparent">
      <!-- 第一區塊開始 -->
      <div ref="section1">
        <div
          ref="banner"
          class="mainWidth h-[85vh] md:h-screen flex flex-col justify-center items-center w-full"
        >
          <div
            class="relative flex flex-col items-center justify-between bg-center bg-no-repeat bg-contain logoM w-60 sm:w-1/2 h-3/4 md:w-full md:h-screen md:items-stretch"
          >
            <div
              class="titleBanner w-340 h-80 md:w-480 md:h-110 bg-cover bg-no-repeat bg-center mt-4 md:mt-14 md:ml-28 absolute left-1/2 top-[-5%] transform -translate-x-1/2 md:left-60 md:top-6"
            ></div>
            <div class="logoS w-[350px] h-[380px] bg-cover absolute top-14"></div>
            <div
              class="absolute left-1/2 bottom-[-10%] transform -translate-x-1/2 md:left-3/4 md:bottom-32 lg:bottom-16"
            >
              <div class="flex flex-col items-center justify-end md:flex-row md:mr-20 lg:mr-44">
                <p
                  ref="bannerText"
                  class="mb-5 text-lg font-normal text-center text-white whitespace-nowrap md:text-right md:mr-3 md:mb-0"
                >
                  In 2023, Webconf Is Happening<br />Again After Ten Years.
                </p>

                <router-link
                  id="sellBtn"
                  href="#"
                  :to="{ name: 'agenda' }"
                  class="px-10 py-2 text-lg font-medium transition-all duration-300 border-2 whitespace-nowrap border-custom-teal-500 text-custom-gray-800 hover:text-custom-teal-500 bg-custom-teal-500 hover:bg-custom-teal-700 opacity-0"
                  >查看議程資訊</router-link
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 第一區塊結束 -->

      <!-- 第二區塊開始 -->
      <div
        ref="section2"
        class="relative mx-6 md:mx-24 lg:ml-32 lg:mr-60 my-6 md:my-0 md:py-40 lg:pt-16 bg-transparent 2xl:m-auto 2xl:w-[60vw]"
      >
        <div class="flex flex-col items-end md:flex-row-reverse md:items-center md:justify-end">
          <div class="w-20 h-6 titleDecoration"></div>
          <div
            class="w-full px-5 py-2 mt-1 text-center border bg-custom-gray-800 border-custom-teal-500 md:w-436 md:mr-2 md:mt-0"
          >
            <h1 class="text-4xl font-normal text-custom-teal-500 whitespace-nowrap">
              WebConf Taiwan
            </h1>
          </div>
        </div>

        <div class="flex items-center py-1 border border-custom-teal-500 bg-custom-gray-800">
          <div class="w-8 mt-1 mb-1 mr-2 border-t border-b border-r border-custom-teal-700">
            <div class="my-1 border-t border-b border-custom-teal-700 h-6px"></div>
          </div>
          <p class="text-base font-medium text-custom-pink-700 whitespace-nowrap">
            BACK TO THE FUTURE OF WEBCONF.
          </p>
          <div class="flex-grow mt-1 mb-1 ml-2 border-t border-b border-l border-custom-teal-700">
            <div class="my-1 border-t border-b border-custom-teal-700 h-6px"></div>
          </div>
        </div>
        <div class="relative">
          <div
            class="overflow-hidden border-b border-r bg-custom-gray-800 border-custom-teal-500 md:border-l md:py-8"
          >
            <div class="w-full flex md:relative md:left-[-680px]">
              <div class="hidden mr-2 bg-cover photo2 fixed-width h-350 md:block opacity-30"></div>
              <div class="mr-2 bg-cover photo1 fixed-width h-350"></div>
              <div class="hidden bg-cover photo2 fixed-width h-350 md:block opacity-30"></div>
            </div>
          </div>
          <div class="py-1 border-b border-l border-r bg-custom-gray-800 border-custom-teal-500">
            <div class="border-t border-b h-6px border-custom-teal-700"></div>
          </div>
          <div
            class="scrollbar bg-black border-b border-r border-l border-custom-teal-500 py-5 px-3 md:border-t md:absolute md:right-[-10%] lg:right-[-13%] xl:right-[-10%] md:bottom-[-30%] lg:bottom-[-40%] md:h-200 md:w-300 lg:w-480 xl:w-588 3xl:w-[660px] md:overflow-y-auto md:transform md:-translate-y-1/2"
          >
            <p class="mb-6 text-base font-normal text-white">
              在2023年重啟十年前的WebConf
              研討會中，帶領與會者穿越時間，探索網路的過去、現在和未來。過去十年間，網路發生了巨大的變化，我們將重新審視網路的起源以及它在這些年裡的演進。
            </p>
            <p class="mb-6 text-base font-normal text-white">
              WebConf
              不僅僅關注過去，還關注網頁的未來趨勢和新興技術，並提供業界趨勢及發展方向，以協助企業更好地了解未來網頁發展的方向。從人工智慧和機器學習的興起，到行動優化和響應式設計的重要性不斷提高，這個研討會將深入探討網頁開發的未來和企業如何在網頁技術的快速變化中保持競爭優勢。
            </p>
            <p class="text-base font-normal text-white">
              我們誠摯地邀請您加入我們，一起穿越時空，探索網頁技術的進，並了解未來十年網頁發展的趨勢。
            </p>
          </div>
        </div>

        <div
          ref="logoMan2"
          class="logoMan hidden md:block md:w-300 md:h-370 md:bg-cover md:absolute md:top-0 md:right-[-15%] lg:right-[-18%] xl:right-[-14%] opacity-0"
        ></div>
      </div>
      <!-- 第二區塊結束 -->

      <!-- 第三區塊開始 -->
      <div ref="section3" class="section3 relative py-6 px-5 2xl:w-[75vw] 2xl:mx-auto">
        <div>
          <StylingTitle>
            <template #default>
              <span>講者曝光</span>
            </template>
          </StylingTitle>
        </div>

        <div>
          <div
            id="speaker"
            class="md:flex md:flex-row-reverse"
            :class="{ topHight: isWindowHeight }"
          >
            <div class="md:flex md:flex-col md:items-center md:mt-8 md:mr-8 2xl:mr-0">
              <div
                ref="logoMan3"
                class="logoMan hidden mdl:block md:w-213 md:h-263 xl:w-[317px] xl:h-[392px] md:bg-cover opacity-0"
              ></div>
              <router-link
                href="#"
                :to="{ name: 'agenda' }"
                class="hidden mdl:inline-block w-[180px] h-[45px] mt-[72px] px-8 py-2 text-lg font-medium transition-all duration-300 border-2 whitespace-nowrap border-custom-teal-500 text-custom-gray-800 hover:text-custom-teal-500 bg-custom-teal-500 hover:bg-custom-teal-700"
                >查看議程資訊</router-link
              >
            </div>

            <div
              class="mt-10 flex justify-around md:justify-center md:items-center md:flex-col md:flex-1"
            >
              <ul class="flex flex-col md:flex-row-reverse md:mb-4 md:mr-20 mdl:mr-43 xl:mr-52">
                <li
                  class="flex-shrink-0 mb-4 md:mb-0 md:ml-10"
                  v-for="speaker in speaker1"
                  :key="speaker.displayName"
                >
                  <p
                    class="p-1 text-xl font-medium border-t border-l border-r bg-custom-gray-800 text-custom-teal-500 border-custom-teal-500 md:w-40 md:ml-43"
                  >
                    {{ speaker.displayName }}
                    <span class="text-sm font-medium" v-if="speaker.altName"
                      >({{ speaker.altName }})</span
                    >
                  </p>
                  <div class="md:flex">
                    <div
                      class="hidden px-2 border-t border-b border-l md:block border-custom-teal-500 bg-custom-gray-800"
                    >
                      <div class="h-5 mx-1 mb-3 border-b border-l border-r border-custom-teal-700">
                        <div class="h-5 mx-1 border-l border-r w-7px border-custom-teal-700"></div>
                      </div>
                      <p
                        class="mb-3 text-lg font-normal leading-tight writing-vertical text-custom-pink-700"
                      >
                        SPEAKER
                      </p>
                      <div class="mx-1 border-t border-l border-r h-105 border-custom-teal-700">
                        <div
                          class="mx-1 border-l border-r w-7px h-105 border-custom-teal-700"
                        ></div>
                      </div>
                    </div>
                    <div class="p-1 border border-custom-teal-500 bg-custom-gray-800">
                      <img
                        class="w-145 h-148 sm:w-202 sm:h-206"
                        :src="speaker.avatar"
                        alt="speaker"
                      />
                    </div>
                  </div>
                </li>
              </ul>
              <ul class="flex flex-col mt-10 md:flex-row-reverse md:mt-0">
                <li
                  class="flex-shrink-0 mb-4 md:mb-0 md:ml-10 md:flex md:flex-col-reverse"
                  v-for="speaker in speaker2"
                  :key="speaker.displayName"
                >
                  <p
                    class="p-1 text-xl font-medium border-t border-l border-r bg-custom-gray-800 text-custom-teal-500 md:border-b md:border-t-0 border-custom-teal-500 md:w-40 md:ml-43"
                  >
                    {{ speaker.displayName }}
                    <span class="text-sm font-medium" v-if="speaker.altName"
                      >({{ speaker.altName }})</span
                    >
                  </p>
                  <div class="md:flex">
                    <div
                      class="hidden px-2 border-t border-b border-l md:block border-custom-teal-500 bg-custom-gray-800"
                    >
                      <div class="h-5 mx-1 mb-3 border-b border-l border-r border-custom-teal-700">
                        <div class="h-5 mx-1 border-l border-r w-7px border-custom-teal-700"></div>
                      </div>
                      <p
                        class="mb-3 text-lg font-normal leading-tight writing-vertical text-custom-pink-700"
                      >
                        SPEAKER
                      </p>
                      <div class="mx-1 border-t border-l border-r h-105 border-custom-teal-700">
                        <div
                          class="mx-1 border-l border-r w-7px h-105 border-custom-teal-700"
                        ></div>
                      </div>
                    </div>
                    <div class="p-1 border border-custom-teal-500 bg-custom-gray-800">
                      <img
                        class="w-145 h-148 sm:w-202 sm:h-206"
                        :src="speaker.avatar"
                        alt="speaker"
                      />
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div class="md:hidden flex justify-center">
              <router-link
                href="#"
                :to="{ name: 'agenda' }"
                class="inline-block w-[180px] h-[45px] mt-9 px-8 py-2 text-lg font-medium transition-all duration-300 border-2 whitespace-nowrap border-custom-teal-500 text-custom-gray-800 hover:text-custom-teal-500 bg-custom-teal-500 hover:bg-custom-teal-700"
                >查看議程資訊</router-link
              >
            </div>
          </div>
        </div>
      </div>
      <!-- 第三區塊結束 -->

      <!-- 第四區塊開始 -->
      <div
        ref="section4"
        id="section4Trigger"
        class="md:h-[80vh] 3xl:h-[60vh] relative py-6 px-5 overflow-hidden 2xl:w-[75vw] 2xl:mx-auto"
      >
        <div
          class="logoMan hidden md:w-[230px] md:h-[280px] md:bg-cover md:absolute md:z-20 md:transform md:-translate-x-1/2 md:top-32 md:right-[-20px]"
        ></div>

        <StylingTitle>
          <template #default>
            <span>議程主軸</span>
          </template>
        </StylingTitle>

        <div class="md:absolute md:top-32 md:left-1 lg:left-[15%] mt-8">
          <div class="relative h-64 mx-auto w-335 md:w-374 mb-14">
            <div class="absolute z-10">
              <h3
                class="py-3 text-2xl font-normal text-center border-t border-l border-r md:text-56 bg-custom-gray-800 text-custom-teal-500 border-custom-teal-500 w-75 md:w-157 md:py-4"
              >
                Web
              </h3>

              <div class="flex py-1 border border-custom-teal-500 bg-custom-gray-800">
                <div class="w-5 py-1 my-1 border-t border-b border-r border-custom-teal-700">
                  <div class="border-t border-b h-6px border-custom-teal-700"></div>
                </div>
                <p class="mx-3 font-medium text-custom-pink-700">WEB DEVELOPMENT</p>
                <div class="flex-grow py-1 my-1 border-t border-b border-l border-custom-teal-700">
                  <div class="border-t border-b h-6px border-custom-teal-700"></div>
                </div>
              </div>

              <div
                class="px-3 py-4 border-b border-l border-r md:p-8 bg-custom-gray-800 border-custom-teal-500"
              >
                <p class="font-normal text-white">
                  包含Frontend、 Backend、 DevOps、技術管理等相關議題。將深入探討各種
                  Web技術的最新趨勢、過往發展，以及如何透過這些技術來提升網站或應用程式的品質、效能與安全性。
                </p>
              </div>
            </div>
            <div
              class="w-335 md:w-374 h-180 md:h-212 border border-custom-teal-500 bg-custom-gray-800 opacity-80 absolute top-[61px] md:top-[101px] left-[-15px] md:left-[-32px] z-[9]"
            ></div>
            <div
              class="w-335 md:w-374 h-180 md:h-212 border border-custom-teal-500 bg-custom-gray-800 opacity-60 absolute top-[71px] md:top-[129px] left-[-30px] md:left-[-60px] z-[8]"
            ></div>
            <div
              class="w-335 md:w-374 h-180 md:h-212 border border-custom-teal-500 bg-custom-gray-800 opacity-40 absolute top-[81px] md:top-[153px] left-[-45px] md:left-[-84px] z-[7]"
            ></div>
            <div
              class="w-335 md:w-374 h-180 md:h-212 border border-custom-teal-500 bg-custom-gray-800 opacity-20 absolute top-[91px] md:top-[173px] left-[-60px] md:left-[-104px] z-[6]"
            ></div>
          </div>
        </div>

        <div class="md:absolute md:bottom-10 lg:bottom-[10%] md:right-1 lg:right-[10%]">
          <div class="relative h-64 mx-auto w-335 md:w-374">
            <div class="absolute z-10">
              <h3
                class="py-3 text-2xl font-normal text-center border-t border-l border-r md:text-56 bg-custom-gray-800 text-custom-teal-500 border-custom-teal-500 w-75 md:w-157 md:py-4"
              >
                UI/UX
              </h3>

              <div class="flex py-1 border border-custom-teal-500 bg-custom-gray-800">
                <div class="w-5 py-1 my-1 border-t border-b border-r border-custom-teal-700">
                  <div class="border-t border-b h-6px border-custom-teal-700"></div>
                </div>
                <p class="mx-3 font-medium text-custom-pink-700">UI/UX DESIGN</p>
                <div class="flex-grow py-1 my-1 border-t border-b border-l border-custom-teal-700">
                  <div class="border-t border-b h-6px border-custom-teal-700"></div>
                </div>
              </div>

              <div
                class="px-3 py-4 border-b border-l border-r md:p-8 bg-custom-gray-800 border-custom-teal-500"
              >
                <p class="font-normal text-white">
                  本屆科技年會將探討 UI/UX
                  設計的最新趨勢，包括使用者界面設計、使用者體驗優化、人機互動設計等議題，以深入探討如何打造出引人入勝的用戶體驗，提升產品的價值和競爭力。
                </p>
              </div>
            </div>
            <div
              class="w-335 md:w-374 h-180 md:h-212 border border-custom-teal-500 bg-custom-gray-800 opacity-80 absolute top-[25px] md:top-[35px] left-[-15px] md:left-[-32px] z-[9]"
            ></div>
            <div
              class="w-335 md:w-374 h-180 md:h-212 border border-custom-teal-500 bg-custom-gray-800 opacity-60 absolute top-[13px] md:top-[7px] left-[-30px] md:left-[-60px] z-[8]"
            ></div>
            <div
              class="w-335 md:w-374 h-180 md:h-212 border border-custom-teal-500 bg-custom-gray-800 opacity-40 absolute top-[6px] md:top-[-17px] left-[-45px] md:left-[-84px] z-[7]"
            ></div>
            <div
              class="w-335 md:w-374 h-180 md:h-212 border border-custom-teal-500 bg-custom-gray-800 opacity-20 absolute top-0 md:top-[-37px] left-[-60px] md:left-[-104px] z-[6]"
            ></div>
          </div>
        </div>
      </div>
      <!-- 第四區塊結束 -->

      <!-- 第五區塊開始 -->
      <div ref="section5" class="relative py-6 px-5 overflow-hidden 2xl:w-[75vw] 2xl:mx-auto">
        <div class="mb-8 md:mb-0">
          <StylingTitle>
            <template #default>
              <span>交通資訊</span>
            </template>
          </StylingTitle>
        </div>

        <div class="mb-5 md:mb-0 md:flex md:items-end md:ml-79 lg:ml-167 xl:ml-20">
          <h4
            class="py-2 font-medium leading-normal text-center border text-32 text-custom-teal-500 md:py-1 bg-custom-gray-800 md:border-b-0 border-custom-teal-500 md:w-340"
          >
            張榮發國際會議中心
          </h4>
          <div
            class="flex items-center justify-center py-2 border-b border-l border-r bg-custom-gray-800 md:border-b-0 md:border-l-0 md:border-t border-custom-teal-500 w-253 md:w-267 md:h-10"
          >
            <div class="w-5 h-5 mr-2 locationIcon"></div>
            <p class="text-sm font-normal leading-normal text-white">100台北市中正區中山南路11號</p>
          </div>
        </div>

        <div class="relative z-20 md:flex md:ml-10 lg:ml-32 xl:ml-20">
          <ul class="flex justify-between md:flex-col">
            <li class="flex-1 border writing-vertical border-custom-teal-500 bg-custom-gray-800">
              <a
                href="#"
                class="block text-lg text-custom-pink-700 opacity-40"
                :class="{ 'opacity-100': currentTrafficInfo.transportation === 'car' }"
                @click.prevent="toggleTrafficInfo('car', '開車')"
              >
                <div class="flex justify-between py-1 md:py-0 md:px-1">
                  <div
                    class="flex-1 md:h-5 my-1.5 md:my-0 md:mx-1.5 py-1 md:py-0 md:px-1 border-t md:border-t-0 border-b border-r md:border-l border-custom-teal-700"
                    :class="{ 'border-color-teal': currentTrafficInfo.transportation === 'car' }"
                  >
                    <div
                      class="border-t border-b border-l border-r md:border-t-0 md:border-b-0 border-custom-teal-700 h-6px md:h-full md:w-2"
                      :class="{ 'border-color-teal': currentTrafficInfo.transportation === 'car' }"
                    ></div>
                  </div>
                  <p class="mx-2 md:mx-0 md:my-2">BY CAR</p>
                  <div
                    class="flex-1 my-1.5 md:my-0 md:mx-1.5 py-1 md:py-0 md:px-1 border-t border-b md:border-b-0 border-l md:border-r border-custom-teal-700"
                    :class="{ 'border-color-teal': currentTrafficInfo.transportation === 'car' }"
                  >
                    <div
                      class="border-t border-b md:border-t-0 md:border-b-0 md:border-l md:border-r border-custom-teal-700 h-6px md:h-full md:w-2"
                      :class="{ 'border-color-teal': currentTrafficInfo.transportation === 'car' }"
                    ></div>
                  </div>
                </div>
              </a>
            </li>
            <li class="flex-1 border writing-vertical border-custom-teal-500 bg-custom-gray-800">
              <a
                href="#"
                class="block text-lg text-custom-pink-700 opacity-40"
                :class="{ 'opacity-100': currentTrafficInfo.transportation === 'MRT' }"
                @click.prevent="toggleTrafficInfo('MRT', '搭捷運')"
              >
                <div class="flex justify-between py-1 md:py-0 md:px-1">
                  <div
                    class="flex-1 md:h-5 my-1.5 md:my-0 md:mx-1.5 py-1 md:py-0 md:px-1 border-t md:border-t-0 border-b border-r md:border-l border-custom-teal-700"
                    :class="{ 'border-color-teal': currentTrafficInfo.transportation === 'MRT' }"
                  >
                    <div
                      class="border-t border-b border-l border-r md:border-t-0 md:border-b-0 border-custom-teal-700 h-6px md:h-full md:w-2"
                      :class="{ 'border-color-teal': currentTrafficInfo.transportation === 'MRT' }"
                    ></div>
                  </div>
                  <p class="mx-2 md:mx-0 md:my-2">BY MRT</p>
                  <div
                    class="flex-1 my-1.5 md:my-0 md:mx-1.5 py-1 md:py-0 md:px-1 border-t border-b md:border-b-0 border-l md:border-r border-custom-teal-700"
                    :class="{ 'border-color-teal': currentTrafficInfo.transportation === 'MRT' }"
                  >
                    <div
                      class="border-t border-b md:border-t-0 md:border-b-0 md:border-l md:border-r border-custom-teal-700 h-6px md:h-full md:w-2"
                      :class="{ 'border-color-teal': currentTrafficInfo.transportation === 'MRT' }"
                    ></div>
                  </div>
                </div>
              </a>
            </li>
            <li class="flex-1 border writing-vertical border-custom-teal-500 bg-custom-gray-800">
              <a
                href="#"
                class="block text-lg text-custom-pink-700 opacity-40"
                :class="{ 'opacity-100': currentTrafficInfo.transportation === 'bus' }"
                @click.prevent="toggleTrafficInfo('bus', '搭公車')"
              >
                <div class="flex justify-between py-1 md:py-0 md:px-1">
                  <div
                    class="flex-1 md:h-5 my-1.5 md:my-0 md:mx-1.5 py-1 md:py-0 md:px-1 border-t md:border-t-0 border-b border-r md:border-l border-custom-teal-700"
                    :class="{ 'border-color-teal': currentTrafficInfo.transportation === 'bus' }"
                  >
                    <div
                      class="border-t border-b border-l border-r md:border-t-0 md:border-b-0 border-custom-teal-700 h-6px md:h-full md:w-2"
                      :class="{ 'border-color-teal': currentTrafficInfo.transportation === 'bus' }"
                    ></div>
                  </div>
                  <p class="mx-2 md:mx-0 md:my-2">BY BUS</p>
                  <div
                    class="flex-1 my-1.5 md:my-0 md:mx-1.5 py-1 md:py-0 md:px-1 border-t border-b md:border-b-0 border-l md:border-r border-custom-teal-700"
                    :class="{ 'border-color-teal': currentTrafficInfo.transportation === 'bus' }"
                  >
                    <div
                      class="border-t border-b md:border-t-0 md:border-b-0 md:border-l md:border-r border-custom-teal-700 h-6px md:h-full md:w-2"
                      :class="{ 'border-color-teal': currentTrafficInfo.transportation === 'bus' }"
                    ></div>
                  </div>
                </div>
              </a>
            </li>
          </ul>

          <div class="border bg-custom-gray-800 border-custom-teal-500 md:w-762 md:h-460 md:p-3">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3614.8534088865276!2d121.51685122061681!3d25.039048402679413!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442a975c13ae63d%3A0x99f529730969be7f!2z6LKh5ZyY5rOV5Lq65by15qau55m85Z-66YeR5pyD!5e0!3m2!1szh-TW!2stw!4v1684658779278!5m2!1szh-TW!2stw"
              width="100%"
              height="100%"
              class="border-r border-l border-custom-teal-500 h-[200px] md:h-250 mb-5"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
            <div class="flex items-center mb-4 ml-4">
              <div
                class="w-10 h-10 mr-2"
                :class="{
                  carIcon: currentTrafficInfo.transportation === 'car',
                  MRTIcon: currentTrafficInfo.transportation === 'MRT',
                  busIcon: currentTrafficInfo.transportation === 'bus',
                }"
              ></div>
              <p class="text-lg font-medium text-custom-teal-500 md:text-xl">
                {{ currentTrafficInfo.method }}
              </p>
            </div>
            <ul class="mb-4 mr-5 ml-11 md:mb-0">
              <li v-for="item in currentTrafficInfo.info" :key="item" class="text-white list-disc">
                {{ item }}
              </li>
            </ul>
          </div>
        </div>

        <div class="absolute right-0 z-0 hidden bg-cover logoMan xl:block w-370 h-456 top-36">
          <div
            ref="car"
            class="carImage hidden xl:block w-[330px] h-[175px] bg-cover absolute top-72 right-[200%] 3xl:right-[300%] z-10"
          ></div>
          <div
            ref="MRT"
            class="MRTImage hidden xl:block w-[330px] h-[180px] bg-cover absolute top-72 right-[200%] 3xl:right-[300%] z-10"
          ></div>
          <div
            ref="bus"
            class="busImage hidden xl:block w-[330px] h-[180px] bg-cover absolute top-72 right-[200%] 3xl:right-[300%] z-10"
          ></div>
        </div>
      </div>
      <!-- 第五區塊結束 -->

      <!-- 第六區塊開始 -->
      <div
        ref="section6"
        class="relative flex flex-col items-center justify-center py-20 overflow-hidden"
      >
        <div class="flex flex-col items-center">
          <div
            class="mb-4 bg-cover logoSpider md:relative w-335 h-180 sm:w-374 sm:h-52 md:w-660 md:h-350"
          >
            <div
              class="hidden bg-cover join md:block md:w-90 md:h-90 md:absolute md:left-16 md:top-20"
            ></div>
          </div>
          <div class="bg-cover timeAdd w-300 h-14 md:w-588 md:h-8 mb-7"></div>

          <!-- 購票按鈕 -->
          <a
            href="https://www.accupass.com/event/2306070448221749426689"
            target="_blank"
            class="px-10 py-2 mb-4 text-lg font-medium transition-all duration-300 border-2 whitespace-nowrap border-custom-teal-500 text-custom-gray-800 hover:text-custom-teal-500 bg-custom-teal-500 hover:bg-custom-teal-700"
            >前往購票</a
          >

          <a
            href="https://www.facebook.com/WebConfTaiwan"
            target="_blank"
            class="text-sm font-normal text-white"
            >敬請關注 Facebook 最新消息</a
          >
        </div>

        <div class="mt-3 md:pr-[34px]">
          <div
            class="swiper w-[560px] h-[240px] xsm:w-[500px] xsm:h-[120px] md:w-[870px] md:h-[136px]"
          >
            <div class="swiper-wrapper">
              <div class="swiper-slide p-[3px] border border-custom-teal-500 bg-custom-gray-800">
                <div class="sponsorsTrafficInfo"></div>
              </div>
              <div class="swiper-slide p-[3px] border border-custom-teal-500 bg-custom-gray-800">
                <div class="sponsorsPicCollage"></div>
              </div>
              <div class="swiper-slide p-[3px] border border-custom-teal-500 bg-custom-gray-800">
                <div class="sponsorsKdanmobile"></div>
              </div>
              <div class="swiper-slide p-[3px] border border-custom-teal-500 bg-custom-gray-800">
                <div class="sponsorsHexschool"></div>
              </div>
              <div class="swiper-slide p-[3px] border border-custom-teal-500 bg-custom-gray-800">
                <div class="sponsors5xruby"></div>
              </div>
              <div class="swiper-slide p-[3px] border border-custom-teal-500 bg-custom-gray-800">
                <div class="sponsorsTrafficInfo"></div>
              </div>
              <div class="swiper-slide p-[3px] border border-custom-teal-500 bg-custom-gray-800">
                <div class="sponsorsPicCollage"></div>
              </div>
              <div class="swiper-slide p-[3px] border border-custom-teal-500 bg-custom-gray-800">
                <div class="sponsorsKdanmobile"></div>
              </div>
              <div class="swiper-slide p-[3px] border border-custom-teal-500 bg-custom-gray-800">
                <div class="sponsorsHexschool"></div>
              </div>
              <div class="swiper-slide p-[3px] border border-custom-teal-500 bg-custom-gray-800">
                <div class="sponsors5xruby"></div>
              </div>
            </div>

            <div class="swiper-pagination transparent"></div>

            <div class="swiper-button-prev transparent"></div>
            <div class="swiper-button-next transparent"></div>

            <div class="swiper-scrollbar transparent"></div>
          </div>
        </div>
      </div>
      <!-- 第六區塊結束 -->
    </div>

    <div
      class="fixed z-30 hidden md:block logoTxt w-138 h-9 top-6 left-6"
      v-if="currentSpiderNum !== 1"
    ></div>

    <div
      class="fixed z-30 hidden transition-opacity duration-300 md:block bottom-6 left-6"
      :class="{
        'opacity-0': currentSpiderNum === 1 || currentSpiderNum === 6,
        'opacity-100': currentSpiderNum !== 1 && currentSpiderNum !== 6,
      }"
    >
      <StylingFBLink></StylingFBLink>
    </div>

    <!-- 首頁尾巴 -->
  </div>
</template>

<style scoped>
/* 手機版 */
.bgImage {
  background-image: url("@/assets/images/bg_m.png");
}
.logo {
  background-image: url("@/assets/images/logo_all_m.png");
}
.logoS {
  background-image: url("@/assets/images/logo_all_m.png");
}
.titleBanner {
  background-image: url("@/assets/images/title_banner.svg");
}
.mainWidth {
  width: 100vw;
}
.titleDecoration {
  background: url("@/assets/images/title_display.svg") no-repeat;
}
.photo1 {
  background-image: url("@/assets/images/photo_1.png");
}
.photo2 {
  background-image: url("@/assets/images/photo_2.png");
}
.fixed-width {
  flex-shrink: 0;
  flex-basis: 701px;
}
.logoMan {
  background-image: url("@/assets/images/logo_man.png");
}
.locationIcon {
  background-image: url("@/assets/images/icon/ic_location_s.svg");
}
.carIcon {
  background-image: url("@/assets/images/icon/ic_byCar_l.svg");
}
.MRTIcon {
  background-image: url("@/assets/images/icon/ic_byMRT_l.svg");
}
.busIcon {
  background-image: url("@/assets/images/icon/ic_byBus_l.svg");
}

.carImage {
  background-image: url("@/assets/images/traffic_car.png");
}
.MRTImage {
  background-image: url("@/assets/images/traffic_mrt.png");
}
.busImage {
  background-image: url("@/assets/images/traffic_bus.png");
}

.logoSpider {
  background-image: url("@/assets/images/logo_spider.png");
}

.timeAdd {
  background-image: url("@/assets/images/time_add_m.svg");
}

.join {
  background-image: url("@/assets/images/join.svg");
}

.opacity-40.opacity-100 {
  opacity: 1;
}

.border-color-teal {
  border-color: #3ef0fc;
}

.sponsorsPicCollage {
  background: url("@/assets/images/sponsors/picCollage.svg");
  background-size: cover;
  background-position: center center;
  width: 100%;
  height: 100%;
}

.sponsorsKdanmobile {
  background: url("@/assets/images/sponsors/kdanmobile.svg");
  background-size: cover;
  background-position: center center;
  width: 100%;
  height: 100%;
}

.sponsorsTrafficInfo {
  background: url("@/assets/images/sponsors/titansoft.svg");
  background-size: cover;
  background-position: center center;
  width: 100%;
  height: 100%;
}

.sponsorsHexschool {
  background: url("@/assets/images/sponsors/hexschool.svg");
  background-size: cover;
  background-position: center center;
  width: 100%;
  height: 100%;
}

.sponsors5xruby {
  background: url("@/assets/images/sponsors/5xruby.svg");
  background-size: cover;
  background-position: center center;
  width: 100%;
  height: 100%;
}

.transparent {
  color: transparent;
  background: transparent;
  cursor: default;
}

@media (min-width: 768px) {
  .bgImage {
    background-image: url("@/assets/images/bg.png");
  }
  .logo {
    background-image: url("@/assets/images/logo_all.png");
  }
  .logoS {
    background-image: none;
  }
  .logoM {
    background-image: url("@/assets/images/logo_all.png");
  }
  .mainWidth {
    width: calc(100vw - 60px);
  }
  .scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar::-webkit-scrollbar-track {
    width: 6px;
    background-image: linear-gradient(90deg, transparent, #006a97, transparent);
  }
  .scrollbar::-webkit-scrollbar-thumb {
    background-color: #3ef0fc;
    border-radius: 5px;
  }
  .logoTxt {
    background-image: url("@/assets/images/logo_txt.svg");
  }
  .writing-vertical {
    writing-mode: vertical-rl;
  }

  .timeAdd {
    background-image: url("@/assets/images/time_add.svg");
  }

  .topHight {
    top: 9rem;
  }
}
</style>

<script setup>
/* eslint-disable */
import { ref, onMounted, inject } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useScrollStore } from "@/stores/scroll";
import { usePageInfoStore } from "@/stores/pageInfo";
import { speakers } from "@/content/speakers";
import { trafficInfo } from "@/content/trafficInfo";
import StylingTitle from "@/components/StylingTitle.vue";
import StylingFBLink from "@/components/StylingFBLink.vue";

const swiperInit = () => {
  const swiper = new Swiper('.swiper', {
  loop: true,
  // slidesPerView: 5,
  // spaceBetween: 8,
  autoplay: {
    delay: 3000,
    reverseDirection: true,
  },
  breakpoints: {
    250: {
      slidesPerView: 2,
      centeredSlides: true,
    },
    560: {
      slidesPerView: 3,
      centeredSlides: false,
    },
    768: {
      slidesPerView: 5,
      centeredSlides: false,
    },
  },
  on: {
    slideChange: function () {
      const windowWidth = window.innerWidth;
      const slides = this.slides;
      const activeIndex = this.activeIndex;

      if (windowWidth >= 768) {
        slides.forEach((slide, index) => {
          let opacity = 0.2;
          let scale = 0.5;
          let transformOrigin = 'center';
          if (index === activeIndex) {
            opacity = 0.6
            scale = 0.8
            transformOrigin = 'right';
          } else if (index === activeIndex + 1) {
            opacity = 0.8
            scale = 0.9
            transformOrigin = 'right';
            slide.style.marginRight = '17px';
          } else if (index === activeIndex + 3) {
            opacity = 0.8
            scale = 0.9
            transformOrigin = 'left';
            slide.style.marginLeft = '17px';
          } else if (index === activeIndex + 4) {
            opacity = 0.6
            scale = 0.8
            transformOrigin = 'left';
            slide.style.marginLeft = '0px';
          } else if (index === activeIndex + 2) {
            opacity = 1
            scale = 1
            slide.style.marginRight = '0px';
          }
          slide.style.opacity = opacity;
          slide.style.transform = `scale(${scale})`;
          slide.style.transformOrigin = transformOrigin;
        });
      } else if (windowWidth <= 767 && windowWidth >= 560) {
        slides.forEach((slide, index) => {
          let opacity = 0.2;
          let scale = 0.5;
          if (index === activeIndex) {
            opacity = 0.8
            scale = 0.9
          } else if (index === activeIndex + 2) {
            opacity = 0.8
            scale = 0.9
          } else if (index === activeIndex + 1) {
            opacity = 1
            scale = 1
          }
          slide.style.opacity = opacity;
          slide.style.transform = `scale(${scale})`;
        });
      } else if (windowWidth < 560) {
        slides.forEach((slide, index) => {
          let opacity = 0.8;
          let scale = 0.9;
          if (index === activeIndex) {
            opacity = 1
            scale = 1
          }
          slide.style.opacity = opacity;
          slide.style.transform = `scale(${scale})`;
        });
      }
    },
  },
});
}


const route = useRoute();

const scrollStore = useScrollStore();
const { currentSpiderNum, isClicking, scrollIntoViewFn, toggleSpiderLineHeightFn } =
  storeToRefs(scrollStore);
const { setSpiderLocation } = scrollStore;

const pageInfoStore = usePageInfoStore();
const { setCurrentPageName } = pageInfoStore;

const gsap = inject("gsap");
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
const isWindowHeight = ref(false);
const logoMan2 = ref();
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
let section1AnimeScrollTl = null;

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
    top: "19rem",
    right: "1rem",
    duration: 0.5,
    ease: "power2.out",
  });

  if (!isFirst) {
    const previousRefName = `${previousTransportation}.value`;
    const previousRefValue = eval(previousRefName);
    gsap.to(previousRefValue, {
      right: "-30rem",
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        moveBack(previousRefValue);
      },
    });
  }
};

const moveBack = (previousRefValue) => {
  const viewportWidth = window.innerWidth;
  if (viewportWidth >= 2000) {
    gsap.set(previousRefValue, { right: "300%" });
  } else {
    gsap.set(previousRefValue, { right: "200%" });
  }
};

const showHomePage = () => {
  gsap.to(loading.value, { autoAlpha: 0, duration: 0 });
  section1Anime();
  toggleTrafficInfo("car", "開車", true);
};

const section1AnimeTl = gsap.timeline();
const section1LeaveAnimeTl = gsap.timeline();

const section1Anime = () => {
  section1EnterAnime();

  setTimeout(() => {
    section1AnimeScrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: section1.value,
        start: "center-=100",
        end: "center+=100",
        // markers: true,
        scrub: true,
        // onLeaveBack: () => {
        //   section1ReturnAnime();
        // },
        // onEnter: () => {
        // section1LeaveAnime();
        // },
      },
    });
  });
};

const section1EnterAnime = () => {
  const sellBtn = document.querySelector("#sellBtn");
  section1AnimeTl.from(banner.value, { duration: 0.5, scale: 0.5, opacity: 0, ease: "power4.out" });
  section1AnimeTl.fromTo(sellBtn, 
  {
    opacity: 0,
  },
  {
    opacity: 1,
    duration: 0.5,
    ease: "power4.out",
  },)
  section1AnimeTl.fromTo(
    bannerText.value,
    {
      x: "-30%",
      opacity: 0,
    },
    {
      x: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power4.out",
    }
  );
};

const section1LeaveAnime = () => {
  section1LeaveAnimeTl.to(section1.value, { xPercent: 100, opacity: 0, duration: 1 });
  section1LeaveAnimeTl.to(section1.value, { xPercent: 0, opacity: 0, duration: 0.2 });
};

const section1ReturnAnime = () => {
  section1LeaveAnimeTl.to(section1.value, { xPercent: 0, opacity: 1, duration: 0.2 });
  section1EnterAnime();
};

let section2AnimeTl = gsap.timeline();

const section2Anime = () => {
  setTimeout(() => {
    section2AnimeTl = gsap.timeline({
      scrollTrigger: {
        trigger: section2.value,
        start: "top center",
        // endTrigger: section3.value,
        // end: "center+=50 bottom",
        // markers: true,
        scrub: true,
        once: true,
        onEnter: () => {
          section2EnterAnime();
        },
        // onLeaveBack: () => {
        //   section2EnterAnime();
        // },
        // onLeave: () => {
        //   section2LeaveAnime();
        // },
        // onUpdate: () => {
        //   section2EnterAnime();
        // },
      },
    });
  });
}

const section2EnterAnime = () => {
  section1AnimeTl.fromTo(
    logoMan2.value,
    {
      x: "-50%",
      opacity: 0,
    },
    {
      x: 0,
      opacity: 1,
      duration: 1,
      ease: "power4.out",
    }
  );
};

// const section2LeaveAnime = () => {
//   section1AnimeTl.to(
//     logoMan2.value,
//     {
//       opacity: 0,
//       duration: 0,
//       ease: "power4.out",
//     }
//   );
// };

let section3AnimeTl = gsap.timeline();

const section3Anime = () => {
  setTimeout(() => {
    section3AnimeTl = gsap.timeline({
      scrollTrigger: {
        trigger: section3.value,
        start: "top+=100 center",
        // endTrigger: section3.value,
        // end: "center+=50 bottom",
        markers: true,
        scrub: true,
        once: true,
        onEnter: () => {
          section3EnterAnime();
        },
      },
    });

    // speakerMoveRightTl = gsap.timeline({
    //   scrollTrigger: {
    //     trigger: section3.value,
    //     start: "top+=60",
    //     endTrigger: section4.value,
    //     end: "top bottom",
    //     pin: true,
    //     // markers: true,
    //     scrub: true,
    //     onUpdate: () => {},
    //   },
    // });

    // const speaker = document.querySelector("#speaker");
    // const speaker1 = document.querySelector("#speaker1-1");
    // const speaker2 = document.querySelector("#speaker1-2");
    // const speaker3 = document.querySelector("#speaker1-3");
    // const speaker4 = document.querySelector("#speaker1-4");
    // const speaker5 = document.querySelector("#speaker1-5");
    // const speaker6 = document.querySelector("#speaker2-1");
    // const speaker7 = document.querySelector("#speaker2-2");
    // const speaker8 = document.querySelector("#speaker2-3");
    // const speaker9 = document.querySelector("#speaker2-4");
    // const speaker10 = document.querySelector("#speaker2-5");

    // const screenWidth = window.innerWidth;

    // speakerMoveRightTl.to([speaker1, speaker6], {
    //   opacity: 1,
    // });
    // speakerMoveRightTl.to([speaker2, speaker7], {
    //   opacity: 1,
    // });
    // speakerMoveRightTl.to(speaker, {
    //   x: 150,
    // });
    
    // speakerMoveRightTl.to([speaker3, speaker8], {
    //   opacity: 1,
    // });
    // speakerMoveRightTl.to([speaker4, speaker9], {
    //   opacity: 1,
    // });
    // speakerMoveRightTl.to([speaker5, speaker10], {
    //   opacity: 1,
    // });

    // if (screenWidth >= 768 && screenWidth < 900) {
    //   speakerMoveRightTl.to(speaker, {
    //     x: 1500,
    //   });
    // } else if (screenWidth >= 900 && screenWidth < 1024) {
    //   speakerMoveRightTl.to(speaker, {
    //     x: 1350,
    //   });
    // } else if (screenWidth >= 1024 && screenWidth < 1280) {
    //   speakerMoveRightTl.to(speaker, {
    //     x: 1200,
    //   });
    // } else if (screenWidth >= 1280 && screenWidth < 1400) {
    //   speakerMoveRightTl.to(speaker, {
    //     x: 900,
    //   });
    // } else if (screenWidth >= 1400 && screenWidth < 1536) {
    //   speakerMoveRightTl.to(speaker, {
    //     x: 800,
    //   });
    // } else if (screenWidth >= 1536 && screenWidth < 1670) {
    //   speakerMoveRightTl.to(speaker, {
    //     x: 650,
    //   });
    // } else if (screenWidth >= 1670 && screenWidth < 1920) {
    //   speakerMoveRightTl.to(speaker, {
    //     x: 470,
    //   });
    // } else if (screenWidth >= 1920) {
    //   speakerMoveRightTl.to(speaker, {
    //     x: 370,
    //   });
    // }
  });
};

const section3EnterAnime = () => {
  section1AnimeTl.fromTo(
    logoMan3.value,
    {
      x: "-50%",
      opacity: 0,
    },
    {
      x: 0,
      opacity: 1,
      duration: 1,
      ease: "power4.out",
    }
  );
};

const scrollIntoView = (num) => {
  const section1Height = section1.value.offsetHeight;
  const section2Height = section2.value.offsetHeight;
  const scrollPosition = section1Height + section2Height - 50;
  
  switch (num) {
    case 1:
      section1.value.scrollIntoView({ behavior: "smooth" });
      break;
    case 2:
      section2.value.scrollIntoView({ behavior: "smooth" });
      break;
    case 3:
      // window.scrollTo({ top: scrollPosition, behavior: "smooth" });
      section3.value.scrollIntoView({ behavior: "smooth" });
      break;
    case 4:
      section4.value.scrollIntoView({ behavior: "smooth" });
      break;
    case 5:
      section5.value.scrollIntoView({ behavior: "smooth" });
      break;
    case 6:
      section6.value.scrollIntoView({ behavior: "smooth" });
      break;

    default:
      break;
  }
};

// loading
const loading = ref(null);
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
  }, 800);
}

const handleScroll = () => {
  if (isClicking.value) {
    // 若正在點擊操作中，則不處理滾輪事件
    return;
  }

  // 根據滾輪位置偵測區塊
  const sections = [section1, section2, section3, section4, section5, section6];

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
  }, 500);
};


const detectWindowHeight = () => {
  const windowHeight = window.innerHeight;

  isWindowHeight.value = windowHeight < 746? true : false;
}

onMounted(() => {
  // 計算蜘蛛圖片距離視窗最上方的距離
  calculateSpiderTop();
  detectWindowHeight();
  
  // 模擬載入過程
  showHome.value = true;
  setTimeout(() => {
    updateLoading();
    setSpiderLocation(1, true);
    toggleSpiderLineHeightFn.value(1);
    setTimeout(() => {
      showHomePage();
    }, 1000);
  }, 100);

  setCurrentPageName(route.name);

  scrollIntoViewFn.value = scrollIntoView;

  speaker1.value = speakers.speaker1;
  speaker2.value = speakers.speaker2;

  setTimeout(() => {
    const viewportWidth = window.innerWidth;
    if (viewportWidth >= 768) {
      window.addEventListener("wheel", handleScroll);
      section3Anime();
      section2Anime();
    }
    swiperInit();
  });
});

</script>

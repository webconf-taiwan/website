<script lang="ts" setup>
useSeoMeta({
  title: '贊助廠商',
})
</script>

<template>
  <section class="flex-1">
    <!-- Banner 區塊 -->
    <div class="sponsors-section relative h-80 text-webconf-gray lg:h-400">
      <!-- 浮動方框 -->
      <ShareLayoutBlocks />

      <!-- 桌機使用 -->
      <svg
        class="absolute inset-0 hidden size-full sm:block"
        viewBox="0 0 1440 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <!-- 右側斜線 -->
        <g>
          <!-- 靜態軌道 -->
          <line
            x1="995"
            y1="0"
            x2="1410"
            y2="400"
            stroke="#E6E6E6"
            stroke-width="0.5"
          />
        </g>

        <!-- 左側斜線 -->
        <g>
          <!-- 靜態軌道 -->
          <line
            x1="0"
            y1="55"
            x2="345"
            y2="400"
            stroke="#E6E6E6"
            stroke-width="0.5"
          />
        </g>
      </svg>
      <!-- 平板以下使用 -->
      <svg
        class="absolute inset-0 block size-full sm:hidden"
        viewBox="0 0 360 320"
        preserveAspectRatio="xMidYMid slice"
      >
        <!-- 右側斜線 -->
        <g>
          <!-- 靜態軌道 -->
          <line
            x1="185"
            y1="0"
            x2="525"
            y2="320"
            stroke="#E6E6E6"
            stroke-width="0.5"
          />
        </g>
      </svg>
      <div
        class="absolute left-[50%] top-[45%] flex w-fit -translate-x-1/2 flex-col items-center justify-center gap-6 px-6 sm:top-[38%] lg:top-[50%] lg:w-full lg:flex-row lg:items-end"
      >
        <h1 class="text-h1-96 text-white">
          SPONSORS
        </h1>
        <div class="flex w-full flex-col gap-3 lg:w-fit">
          <span
            class="inline-block px-0 text-center text-h4-24 lg:pl-[150px] lg:pr-10"
          >贊助廠商</span>
          <div class="order-[-1] flex items-center lg:order-1">
            <span class="size-3 bg-webconf-gray"></span>
            <span class="h-[1px] flex-1 bg-webconf-gray"></span>
            <span class="size-3 bg-webconf-gray"></span>
          </div>
        </div>
      </div>

      <div
        v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
        class="absolute bottom-0 left-0 h-[1px] w-full bg-webconf-gray"
      ></div>
    </div>

    <!-- 贊助招募內容 -->
    <div class="relative md:pb-[116px] md:pt-[120px]">
      <!-- 活動照片 -->
      <NuxtImg
        src="/images/sponsors-1.webp"
        width="254"
        height="169"
        alt="WebConf Taiwan 活動照片"
        class="blue-shadow sponsors-img-filter absolute left-[-94px] top-[392px] hidden sm:block"
      />
      <NuxtImg
        src="/images/sponsors-1.webp"
        width="361"
        height="241"
        alt="WebConf Taiwan 活動照片"
        class="blue-shadow sponsors-img-filter absolute right-[-40px] top-[80px] hidden sm:block"
      />
      <NuxtImg
        src="/images/sponsors-3.webp"
        width="348"
        height="232"
        alt="WebConf Taiwan 活動照片"
        class="blue-shadow sponsors-img-filter absolute bottom-[80px] left-[-28px] hidden sm:block"
      />
      <NuxtImg
        src="/images/sponsors-4.webp"
        width="240"
        height="160"
        alt="WebConf Taiwan 活動照片"
        class="blue-shadow sponsors-img-filter absolute bottom-[383px] right-[-28px] hidden sm:block"
      />
      <ShareGradientDotsCard
        class="relative m-auto my-0 max-w-[960px] pt-12 text-webconf-gray"
      >
        <!-- 贊助招募 -->
        <div class="pb-[60px] pt-3 sm:pb-20 sm:pt-0">
          <div class="m-auto w-fit">
            <h2 class="px-10 pb-4 text-h3-40">
              贊助招募
            </h2>
            <div class="flex items-center pb-6 sm:pb-12">
              <span class="size-3 bg-webconf-gray"></span>
              <span class="h-[1px] flex-1 bg-webconf-gray"></span>
              <span class="size-3 bg-webconf-gray"></span>
            </div>
          </div>

          <p class="text-body-18 text-white">
            WebConf Taiwan
            是一個聚集網頁技術愛好者與專家的年度盛會。今年，我們將以
            「Connecting the Web to a Sustainable Future」
            為主題，探索網頁技術如何推動永續發展，並帶來創新解方，從技術演進到社會責任，共同思考網路世界的未來。誠摯邀請您成為
            WebConf Taiwan
            的贊助夥伴，一同連結技術與未來，攜手打造更永續的網路生態！
          </p>
        </div>

        <!-- 四大支持 -->
        <div class="pb-[60px] text-white">
          <h2 class="pb-10 text-center text-h3-40">
            我們將提供四大支持
          </h2>

          <ul
            class="grid grid-cols-1 gap-x-0 gap-y-8 sm:grid-cols-2 sm:gap-x-[60px] sm:gap-y-8"
          >
            <li class="flex items-center justify-center gap-6 py-0 sm:py-6">
              <div class="pic">
                <NuxtImg
                  src="/images/sponsors-brand.webp"
                  width="100"
                  height="100"
                  alt="品牌曝光"
                  class="aspect-[1/1] w-[60px] sm:w-[100px]"
                />
              </div>
              <div class="flex flex-1 flex-col gap-0 sm:gap-4">
                <h3 class="text-h4-24">
                  品牌曝光
                </h3>
                <p class="text-body-16">
                  透過活動網站、社群平台與現場的場地陳設皆將呈現您的品牌
                </p>
              </div>
            </li>
            <li class="flex items-center justify-center gap-6 py-0 sm:py-6">
              <div class="pic">
                <NuxtImg
                  src="/images/sponsors-target.webp"
                  width="100"
                  height="100"
                  alt="品牌曝光"
                  class="aspect-[1/1] w-[60px] sm:w-[100px]"
                />
              </div>
              <div class="flex flex-1 flex-col gap-0 sm:gap-4">
                <h3 class="text-h4-24">
                  精準觸及
                </h3>
                <p class="text-body-16">
                  對網頁開發者、設計師、產品經理與產業決策者，直接建立聯繫
                </p>
              </div>
            </li>
            <li class="flex items-center justify-center gap-6 py-0 sm:py-6">
              <div class="pic">
                <NuxtImg
                  src="/images/sponsors-communication.webp"
                  width="100"
                  height="100"
                  alt="品牌曝光"
                  class="aspect-[1/1] w-[60px] sm:w-[100px]"
                />
              </div>
              <div class="flex flex-1 flex-col gap-0 sm:gap-4">
                <h3 class="text-h4-24">
                  專業交流
                </h3>
                <p class="text-body-16">
                  直接與業界專家對話，拓展未來合作與人才招募的可能性
                </p>
              </div>
            </li>
            <li class="flex items-center justify-center gap-6 py-0 sm:py-6">
              <div class="pic">
                <NuxtImg
                  src="/images/sponsors-sustainability.webp"
                  width="100"
                  height="100"
                  alt="品牌曝光"
                  class="aspect-[1/1] w-[60px] sm:w-[100px]"
                />
              </div>
              <div class="flex flex-1 flex-col gap-0 sm:gap-4">
                <h3 class="text-h4-24">
                  共創永續價值
                </h3>
                <p class="text-body-16">
                  與我們一同推廣「科技 x 永續」的願景，展現企業責任與影響力
                </p>
              </div>
            </li>
          </ul>
        </div>

        <ShareLinkButton
          to="mailto:hi@webconf.tw"
          class="m-auto mb-[60px] flex w-fit sm:mb-0"
        >
          聯絡我們
        </ShareLinkButton>
      </ShareGradientDotsCard>
    </div>
  </section>
</template>

<style scoped>
.sponsors-section {
  background-image: url("/images/sponsorsBanner.webp");
  background-repeat: no-repeat;
  background-position: center top;
  background-size: auto 400px;
}

@media (min-width: 640px) {
  .sponsors-section {
    background-position: center;
    background-size: cover;
  }
}
</style>

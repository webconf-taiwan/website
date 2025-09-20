<template>
  <section class="relative">
    <div class="absolute inset-0 overflow-hidden">
      <!-- <div
        v-arrow="{
          speed1: '6s',
          speed2: '4s',
          delay: '0s',
          color: 'white',
          count: 2,
        }"
        class="arrow-border-5 absolute bg-webconf-gray"
      ></div> -->
      <div
        v-arrow="{ speed1: '8s', color: 'white', direction: -1 }"
        class="arrow-border-6 absolute bg-webconf-gray"
      ></div>
      <div
        v-arrow="{
          speed1: '8s',
          speed2: '6s',
          delay: '0s',
          color: 'white',
          count: 2,
        }"
        class="arrow-border-7 absolute bg-webconf-gray"
      ></div>
    </div>
    <div
      class="container flex flex-col p-0 sm:px-16 sm:py-20 lg:flex-row lg:px-20 lg:pb-60"
    >
      <div
        v-cursor="{ scale: 0.4, duration: 0.5 }"
        class="group relative aspect-[1/1] w-full border-[0.5px] border-webconf-frame bg-black px-5 pb-5 pt-[85px] sm:aspect-auto sm:pb-0 sm:pl-[29.14px] sm:pr-[34.24px] sm:pt-[29px] lg:w-[68.75%] lg:pb-[24px] lg:pl-[40px] lg:pr-[47px] lg:pt-0"
      >
        <!-- 標題 -->
        <div class="absolute left-5 top-5 w-fit sm:left-10 sm:top-8">
          <h2 class="flex px-10 pb-3 text-h3-40 text-white sm:pb-4">
            Venue
          </h2>
          <div class="flex items-center">
            <span class="size-3 bg-white"></span>
            <span class="h-[1px] flex-1 bg-white"></span>
            <span class="size-3 bg-white"></span>
          </div>
        </div>

        <!-- 場地圖 -->
        <div class="pic h-full">
          <NuxtImg
            src="/images/venueBg.webp"
            width="793"
            height="536"
            format="webp"
            class="size-full translate-y-0 object-contain sm:translate-y-[10px] lg:translate-y-[-10px]"
          />
          <div
            class="absolute left-0 top-0 block size-full bg-webconf-blue opacity-0 mix-blend-color transition-opacity duration-300 group-hover:opacity-100"
          ></div>
          <div
            class="absolute left-0 top-0 block size-full bg-webconf-blue opacity-0 mix-blend-color transition-opacity duration-300 group-hover:opacity-60"
          ></div>
        </div>
        <!-- 場地標題 -->
        <p
          class="absolute bottom-10 left-12 hidden text-h4-24 text-white lg:block"
        >
          瓶蓋工廠台北製造所
        </p>
        <!-- 指北針圖示 -->
        <NuxtImg
          src="/images/venueCompass.webp"
          format="webp"
          width="161"
          height="117"
          class="absolute right-0 top-12 hidden sm:block"
        />
      </div>
      <ShareGradientDotsCard
        class="relative ml-0 h-fit w-full translate-y-0 sm:px-[60px] sm:pb-[84px] lg:ml-[-12.65%] lg:w-[43.9%] lg:translate-y-[57%] lg:pb-[52px]"
      >
        <div class="items-start">
          <!-- 搭乘工具一 -->
          <div class="flex items-start gap-6 pb-8 text-white sm:gap-8">
            <ShareTag class="my-2">
              搭乘捷運
            </ShareTag>
            <p class="flex-1 text-body-18">
              捷運南港站 1A
              出口，步行至連通道至台鐵/高鐵北門出站，經市民大道向西步行約 5 分鐘
            </p>
          </div>
          <!-- 搭乘工具二 -->
          <div
            class="flex items-start gap-6 pb-10 text-white sm:gap-8 sm:pb-[60px]"
          >
            <ShareTag class="my-2">
              搭乘火車
            </ShareTag>
            <p class="flex-1 text-body-18">
              搭乘至南港火車站的北門出站，經市民大道向西步行約 5 分鐘
            </p>
          </div>
          <ShareLinkButton
            to="#"
            class="m-auto flex w-fit"
          >
            更多資訊
          </ShareLinkButton>
        </div>
      </ShareGradientDotsCard>
    </div>
  </section>
</template>

<style scoped>
.arrow-border-5 {
  --θ: 45deg;
  --column: 12;
  left: calc(var(--grid-size) * var(--column));
  top: 0;
  width: calc((100% - (var(--grid-size) * var(--column))) / cos(var(--θ)));
  height: 1px;
  transform: rotate(var(--θ));
  transform-origin: left center;
}

.arrow-border-6 {
  --θ: 45deg;
  --column: calc(7 - (var(--grid-diff-6)));
  left: 0;
  top: calc(var(--grid-size) * var(--column));
  width: calc((100% - (var(--grid-size) * var(--column))) / cos(var(--θ)));
  height: 1px;
  transform: rotate(var(--θ));
  transform-origin: left center;
}

.arrow-border-7 {
  --θ: 45deg;
  --column: 2.6;
  left: 0;
  top: calc(var(--grid-size) * (var(--column) - var(--grid-diff-7)));
  width: calc((100% - (var(--grid-size) * var(--column))) / cos(var(--θ)));
  height: 1px;
  transform: rotate(var(--θ));
  transform-origin: left center;
}
</style>

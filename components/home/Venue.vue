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
    <div class="container flex px-20 pb-60 pt-20">
      <div
        class="relative w-[65%] border border-webconf-gray/50 bg-black pb-[24px] pl-[40px] pr-[47px] 2xl:w-[68.75%]"
      >
        <NuxtImg
          src="/images/venue.png"
          width="793"
          height="536"
          class="w-full translate-y-[-10px] object-cover"
        />
        <div class="absolute left-10 top-8 w-fit">
          <h2 class="flex px-10 text-h3-40 text-white">
            Venue
          </h2>
          <div class="mt-4 flex items-center">
            <span class="size-3 bg-white"></span>
            <span class="h-[1px] flex-1 bg-white"></span>
            <span class="size-3 bg-white"></span>
          </div>
        </div>
        <p class="absolute bottom-10 left-12 text-h4-24 text-white">
          瓶蓋工廠台北製造所
        </p>
        <NuxtImg
          src="/images/venueCompass.png"
          width="161"
          height="117"
          class="absolute right-0 top-12"
        />
        <div class="blue-overlay"></div>
      </div>
      <ShareGradientDotsCard
        class="relative ml-[-12.5%] h-fit w-[47.5%] flex-1 translate-y-[48%] 2xl:w-[43.5%] 2xl:translate-y-[58%]"
      >
        <div class="flex flex-col items-start">
          <div class="mb-8 flex items-start gap-8 text-white">
            <ShareTag>搭乘捷運</ShareTag>
            <p class="flex-1 text-body-18">
              捷運南港站 1A
              出口，步行至連通道至台鐵/高鐵北門出站，經市民大道向西步行約 5 分鐘
            </p>
          </div>
          <div class="mb-[60px] flex items-start gap-8 text-white">
            <ShareTag>搭乘火車</ShareTag>
            <p class="flex-1 text-body-18">
              搭乘至南港火車站的北門出站，經市民大道向西步行約 5 分鐘
            </p>
          </div>
          <ShareLinkButton
            to="#"
            class="m-auto text-center"
          >
            更多資訊
          </ShareLinkButton>
        </div>
      </ShareGradientDotsCard>
    </div>
  </section>
</template>

<style>
.blue-overlay {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 100%;
  height: 100%;
  background-color: #002eff;
  mix-blend-mode: multiply;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.blue-overlay:hover {
  opacity: 0.8;
}

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

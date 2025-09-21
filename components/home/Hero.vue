<template>
  <section class="hero-section relative min-h-svh w-full lg:h-screen">
    貝茲曲線特效
    <!-- <HomeHeroCurve /> -->
    <div class="absolute inset-0">
      <!-- 斜線特效 -->
      <!-- <div
        v-arrow="{
          speed1: '6s',
          speed2: '4s',
          delay: '0s',
          color: 'white',
          count: 2,
        }"
        class="arrow-border absolute bg-webconf-gray"
      ></div>
      <div
        v-arrow="{ speed1: '8s', color: 'white', direction: -1 }"
        class="arrow-border-2 absolute bg-webconf-gray"
      ></div>
      <div
        v-arrow="{
          speed1: '8s',
          speed2: '6s',
          delay: '0s',
          color: 'white',
          count: 2,
        }"
        class="arrow-border-3 absolute bg-webconf-gray"
      ></div>
      <div
        v-arrow="{ speed1: '8s', color: 'white' }"
        class="arrow-border-4 absolute bg-webconf-gray"
      ></div> -->
      <!-- 標題區域 -->
      <div class="absolute right-[4%] top-[63%] -translate-y-1/2 text-right">
        <div
          class="flex flex-col items-end gap-4 px-5 sm:gap-[52px] sm:px-[52px]"
        >
          <NuxtImg
            src="/images/heroLogo.webp"
            alt="2025 WebConf Logo"
            format="webp"
            width="570"
            height="215"
            class="mr-0 sm:mr-[86px] sm:w-[570px]"
          />
          <NuxtImg
            src="/images/heroTitle.webp"
            alt="Connecting the Web to a Sustainable Future"
            format="webp"
            width="527"
            height="27"
            class="pb-8 sm:w-[527px] sm:pb-0"
          />
          <ShareLinkButton
            to="#"
            class="text-center"
          >
            前往購票
          </ShareLinkButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  background: url("/images/heroBg.webp");
  background-repeat: no-repeat;
  background-position: 68% center;
  background-size: cover;
}

.arrow-border {
  --θ: 45deg;
  --column: calc(var(--grid-diff) + 12.5);
  left: calc(var(--grid-size) * var(--column));
  top: 0;
  width: calc((100% - (var(--grid-size) * var(--column))) / cos(var(--θ)));
  height: 1px;
  transform: rotate(var(--θ));
  transform-origin: left center;
}

.arrow-border-2 {
  --θ: 45deg;
  --column: calc(var(--grid-diff-2) + 3.4);
  left: calc(var(--grid-size) * var(--column));
  top: 0;
  width: calc((100% - (var(--grid-size) * var(--column))) / cos(var(--θ)));
  height: 1px;
  transform: rotate(var(--θ));
  transform-origin: left center;
}

.arrow-border-3 {
  --θ: 45deg;
  --column: 0;
  left: calc(var(--grid-size) * var(--column));
  top: calc(var(--grid-size) * (0.8 + var(--grid-diff-3)));
  width: calc((100% - (var(--grid-size) * var(--column))) / cos(var(--θ)));
  height: 1px;
  transform: rotate(var(--θ));
  transform-origin: left center;
}

.arrow-border-4 {
  left: 0;
  top: calc(var(--grid-size) * (var(--grid-diff-4) + 5.25));
  width: 100%;
  height: 1px;
}
</style>

<template>
  <section class="hero-section relative aspect-[2/1] w-full">
    <div class="absolute inset-0">
      <div
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
      ></div>
      <div class="absolute right-[60px] top-[54%] -translate-y-1/2 text-right">
        <div class="flex flex-col items-end gap-[52px] px-[52px]">
          <NuxtImg
            src="/images/heroLogo.png"
            alt="2025 WebConf Logo"
            format="webp"
            :width="570"
            :height="215"
            class="mr-[86px] lg:w-[570px]"
          />
          <NuxtImg
            src="/images/heroTitle.png"
            alt="Connecting the Web to a Sustainable Future"
            format="webp"
            :width="527"
            :height="27"
            class="lg:w-[527px]"
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

<style>
.hero-section {
  background: url("/images/heroBg.png");
  background-repeat: no-repeat;
  background-position: center -60px;
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

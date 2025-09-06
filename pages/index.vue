<template>
  <ShareBgBorder>
    <HomeNavbar />
    <div class="relative z-10 w-full">
      <img
        class="mt-[-4%] w-full"
        src="/images/heroBg.png"
        alt="hero 背景圖片"
      />
      <div class="relative"></div>
    </div>
    <div
      id="about-section"
      class="relative z-0 min-h-screen w-full"
    >
      <HomeAbout />
    </div>
    <div class="relative z-0 min-h-screen w-full"></div>
    <HomeSiteFooter />
    <HomeCopyRight />
  </ShareBgBorder>
</template>

<style>
.bg {
  width: 100%;
  height: calc(100vh - 2.5rem);
  background-image: url("/images/heroBg.png");
  background-repeat: no-repeat;
  background-position: right bottom;
  background-size: 100% auto;
}
</style>

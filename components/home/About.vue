<template>
  <HomeAboutCard />

  <section class="flex">
    <div class="flex w-1/2 flex-col items-start">
      <NuxtImg
        src="/images/aboutPhotoL1.webp"
        alt="about"
        class="relative left-[120px] mt-[900px]"
      />
      <NuxtImg
        src="/images/aboutPhotoL2.webp"
        alt="about"
        class="relative -left-10 mt-[160px]"
      />
      <NuxtImg
        src="/images/aboutPhotoL3.webp"
        alt="about"
        class="relative left-10 mt-[250px]"
      />
    </div>
    <div class="flex w-1/2 flex-col items-end">
      <NuxtImg
        src="/images/aboutPhotoR1.webp"
        alt="about"
        class="relative right-20 mt-[590px]"
      />
      <NuxtImg
        src="/images/aboutPhotoR2.webp"
        alt="about"
        class="relative right-0 mt-[160px]"
      />
      <NuxtImg
        src="/images/aboutPhotoR3.webp"
        alt="about"
        class="relative right-[120px] mt-[280px]"
      />
    </div>
  </section>
</template>

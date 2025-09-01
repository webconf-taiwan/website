<template>
  <HomeAboutCard />

  <section class="flex">
    <div class="flex w-1/2 flex-col items-start">
      <NuxtImg
        src="/images/aboutPhotoL1.webp"
        alt="about"
        width="360"
        height="240"
        class="relative left-[120px] mt-[900px]"
      />
      <NuxtImg
        src="/images/aboutPhotoL2.webp"
        alt="about"
        width="360"
        height="240"
        class="relative -left-10 mt-[160px]"
      />
      <NuxtImg
        src="/images/aboutPhotoL3.webp"
        alt="about"
        width="439"
        height="293"
        class="relative left-10 mb-[72px] mt-[250px]"
      />
    </div>
    <div class="flex w-1/2 flex-col items-end">
      <NuxtImg
        src="/images/aboutPhotoR1.webp"
        alt="about"
        width="420"
        height="280"
        class="relative right-20 mt-[590px]"
      />
      <NuxtImg
        src="/images/aboutPhotoR2.webp"
        alt="about"
        width="480"
        height="320"
        class="relative right-0 mt-[160px]"
      />
      <NuxtImg
        src="/images/aboutPhotoR3.webp"
        alt="about"
        width="240"
        height="160"
        class="relative right-[120px] mt-[280px]"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ORGANIZERS } from '~/constants/sponsors'
</script>

<template>
  <div
    class="relative mt-[95px] flex flex-col border-y border-webconf-gray bg-black text-white lg:mt-[141px] lg:flex-row"
  >
    <div
      v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
      class="absolute z-30 w-full"
    ></div>
    <div
      class="sponsors-title-section sticky top-[47px] z-20 border-b py-3 pl-5 xs:top-[55px] sm:top-[57px] lg:top-[55px] lg:border-b-0 lg:pl-12 lg:pr-[152px] lg:pt-10"
    >
      <h2
        class="inline-block text-h4-24 text-webconf-gray lg:text-[60px] lg:leading-[1.2] lg:tracking-[0.2em] lg:[writing-mode:vertical-rl]"
      >
        主辦單位
      </h2>
    </div>

    <div
      v-for="organizer in ORGANIZERS"
      :key="organizer.id"
      class="sponsors-content flex-1 lg:border-l"
    >
      <div
        class="relative grid place-content-center border-b-[0.5px] border-webconf-frame before:absolute before:inset-0 before:block before:size-5 before:bg-webconf-blue before:content-[''] lg:before:size-7"
      >
        <NuxtImg
          :src="organizer.logo"
          width="225"
          height="180"
          :alt="`主辦單位${organizer.name}標誌`"
        />
      </div>

      <div class="px-5 py-8 lg:px-10 lg:pb-12 lg:pt-10">
        <h3 class="mb-3 text-h3-40 text-white lg:mb-6">
          {{ organizer.name }}
        </h3>

        <ul class="mb-6 flex gap-3 lg:mb-8">
          <li
            v-for="(link, index) in organizer.socialLinks"
            :key="index"
            v-cursor="{
              scale: 0.5,
              duration: 0.5,
            }"
            class="border border-webconf-blue/90 transition-colors duration-500 hover:bg-webconf-blue"
          >
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="block p-[10px]"
            >
              <NuxtImg
                :src="link.icon"
                width="24"
                height="24"
                :alt="link.name"
              />
            </a>
          </li>
        </ul>

        <p class="text-body-16 text-webconf-gray">
          <span
            v-for="(paragraph, index) in organizer.description"
            :key="index"
            class="organizer-description-paragraph inline-block"
          >
            {{ paragraph }}
          </span>
        </p>
      </div>
    </div>

    <NuxtImg
      class="absolute right-[14.3906px] top-[-409.219px] -z-10 hidden lg:block"
      src="/images/sponsors/sponsors-line.svg"
      width="908"
      height="749"
    />
    <NuxtImg
      class="absolute right-[-36px] top-[-186.375px] -z-10 block lg:hidden"
      src="/images/sponsors/sponsors-line-mobile.svg"
      width="394"
      height="326"
    />
  </div>
</template>

<style scoped>
.sponsors-title-section {
  background-image: url("/images/sponsors/sponsorsBg-mobile.webp");
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: 100% 121px;
}

@media (min-width: 1024px) {
  .sponsors-title-section {
    background-image: url("/images/sponsors/sponsorsBg.webp");
    background-size: 100% 215px;
  }
}

.sponsors-content + .sponsors-content {
  border-top: 1px solid #e6e6e6;
}

.organizer-description-paragraph + .organizer-description-paragraph {
  padding-top: 1rem;
}
</style>

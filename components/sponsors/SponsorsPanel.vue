<script setup lang="ts">
import { SPONSORS_INFO } from '~/constants/sponsors'
</script>

<template>
  <div
    class="flex flex-col border-b border-webconf-gray bg-black text-white lg:flex-row"
  >
    <div
      class="sponsors-title-section sticky top-[47px] z-10 border-b py-3 pl-5 xs:top-[55px] sm:top-[57px] lg:top-[55px] lg:border-b-0 lg:pl-12 lg:pr-[152px] lg:pt-10"
    >
      <h2
        class="inline-block text-h4-24 text-webconf-gray lg:text-[60px] lg:leading-[1.2] lg:tracking-[0.2em] lg:[writing-mode:vertical-rl]"
      >
        贊助商
      </h2>
    </div>

    <div
      v-for="sponsor in SPONSORS_INFO"
      :key="sponsor.id"
      class="sponsors-content flex-1 lg:border-l"
    >
      <div
        class="relative grid place-content-center border-b-[0.5px] border-webconf-frame py-4 before:absolute before:inset-0 before:block before:size-5 before:bg-webconf-blue before:content-[''] lg:py-0 lg:before:size-7"
      >
        <!-- 徽章元素 -->
        <span
          v-if="sponsor.badge"
          class="absolute right-0 top-0 block bg-webconf-gray px-[16px] py-[6px] text-[12px] font-semibold leading-[1.4] tracking-[0.02em] text-webconf-blue"
        >
          {{ sponsor.badge }}
        </span>

        <NuxtImg
          :src="sponsor.logo"
          width="375"
          height="300"
          :alt="`贊助商${sponsor.name}標誌`"
          placeholder
        />
      </div>

      <div class="px-5 py-8 lg:px-10 lg:pb-[60px] lg:pt-10">
        <h3 class="mb-3 text-h3-40 text-white lg:mb-6">
          {{ sponsor.name }}
        </h3>

        <ul class="mb-6 flex gap-3 lg:mb-8">
          <li
            v-for="(link, index) in sponsor.socialLinks"
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
                placeholder
              />
            </a>
          </li>
        </ul>

        <p class="text-body-16 text-webconf-gray">
          {{ sponsor.description }}
        </p>
      </div>
    </div>
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
</style>

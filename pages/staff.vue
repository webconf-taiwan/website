<script setup lang="ts">
import { STAFF } from '~/constants/staff'

useSeoMeta({
  title: '主辦團隊',
})
</script>

<template>
  <div>
    <section class="flex-1">
      <ShareBanner
        title="STAFF"
        sub-title="主辦團隊"
      />
    </section>

    <main
      class="mr-[-0.5px] flex flex-col border-b border-webconf-gray bg-black text-webconf-gray lg:flex-row"
    >
      <aside
        class="sticky top-[54px] z-10 w-full shrink-0 flex-col items-start self-start border-b border-webconf-gray bg-black lg:h-[calc(100dvh-54px)] lg:w-[228px] lg:border-b-0 lg:border-r lg:p-4 2xl:w-[260px] 2xl:pl-12"
      >
        <h2
          class="-translate-x-1 px-5 py-6 text-left text-h4-60 text-webconf-blue duration-300 group-hover:text-white lg:mt-2 lg:block lg:p-0 lg:[writing-mode:vertical-lr]"
        >
          2025 PARTNERS
        </h2>

        <div
          v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
          class="lg:hidden"
        ></div>
      </aside>

      <div
        class="relative z-0 grid w-full grid-cols-1 lg:grid-cols-3 xl:grid-cols-4"
      >
        <ShareGridCard
          v-for="(staff, index) in STAFF"
          :key="`${staff.name}-${index}`"
          :show-square="true"
          :fill-effect="false"
        >
          <div class="flex gap-3 p-5 lg:flex-col lg:p-6 2xl:p-9">
            <div class="relative shrink-0">
              <NuxtImg
                :src="staff.avatarUrl"
                :alt="staff.name"
                width="220"
                height="314"
                class="aspect-speaker-img-full h-[144px] w-[100px] object-cover duration-300 group-hover:grayscale-0 lg:size-full lg:grayscale"
              />

              <ShareGradientMask
                class="hidden group-hover:opacity-0 lg:block"
              />
              <ShareNoiseMask class="hidden group-hover:opacity-0 lg:block" />
            </div>

            <div class="flex flex-col">
              <div class="grow">
                <h3 class="text-h4-24 leading-[1.4]">
                  {{ staff.name }}
                </h3>
                <p class="text-xs leading-[1.4] text-webconf-gray-500">
                  {{ staff.title }}
                </p>
              </div>

              <ul class="relative z-10 mt-3 flex flex-wrap gap-3">
                <li
                  v-for="link in staff.links"
                  :key="`${staff.name}-${link}`"
                >
                  <ShareSnsLink
                    :name="staff.name"
                    :link="link"
                  />
                </li>
              </ul>
            </div>
          </div>
        </ShareGridCard>
      </div>
    </main>
  </div>
</template>

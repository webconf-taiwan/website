<script setup lang="ts">
import { STAFF } from '~/constants/staff'

useSeoMeta({
  title: '主辦團隊',
  description:
    '來自悠識數位、五倍紅寶石、六角學院等單位夥伴共同協力舉辦 WebConf Taiwan 2025。',
})
</script>

<template>
  <div>
    <ShareBanner
      title="STAFF"
      sub-title="主辦團隊"
    />

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
        <LazyStaffCard
          v-for="(staff, index) in STAFF"
          :key="`${staff.name}-${index}`"
          :staff="staff"
          hydrate-on-idle
        />
      </div>
    </main>
  </div>
</template>

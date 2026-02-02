<script setup lang="ts">
import { CUSTOM_AGENDA_ITEM, SPEAKERS } from '~/constants/agenda'

useSeoMeta({
  title: '講者陣容',
  description:
    'WebConf Taiwan 2025 再次集結產業各領域的專家，講者不只是分享技術與設計實務，更是一次難得的跨領域對話，你會聽到真實的挑戰、失敗背後的思考、團隊如何解題，以及那些改變產品方向的關鍵洞察。',
})

// 議程類型篩選
const { selectedTags, handleTagClick } = useSelectedTags()
const isMenuOpen = ref(false)
</script>

<template>
  <div>
    <ShareBanner
      title="SPEAKERS"
      sub-title="講者陣容"
    />

    <main
      class="mr-[-0.5px] border-b border-webconf-gray bg-black text-webconf-gray"
    >
      <section
        class="sticky top-[54px] z-10 border-b border-webconf-gray bg-black lg:hidden"
      >
        <div class="group flex justify-end p-4">
          <label class="flex items-center gap-3">
            <span
              class="text-[28px] font-semibold leading-none text-webconf-blue duration-300 group-hover:text-white"
            >
              FILTER
            </span>

            <ShareTagFilterMenuButton
              :is-menu-open="isMenuOpen"
              size="sm"
              :selected-tags-count="selectedTags.length"
              @click="isMenuOpen = true"
            />
          </label>
        </div>

        <div
          v-arrow="{ speed1: '12s', color: '#E6E6E6' }"
          class="relative z-30"
        ></div>
      </section>

      <section class="relative flex">
        <ShareTagFilterMenuAside
          v-model:is-open="isMenuOpen"
          v-model:selected-tags="selectedTags"
          class="lg:top-[54.5px]"
        />

        <!-- 講者卡片 -->
        <div
          v-cursor="{
            scale: 0.5,
            duration: 0.5,
          }"
          class="relative z-0 grid w-full grid-cols-1 lg:grid-cols-3 xl:grid-cols-4"
        >
          <ShareGridCard
            v-for="(speaker, index) in [...SPEAKERS, CUSTOM_AGENDA_ITEM]"
            :key="`${speaker.name}-${index}`"
            :is-selected="
              speaker.tags?.some((tag) => selectedTags.includes(tag))
                || selectedTags.length === 0
            "
            :show-square="false"
            :fill-effect="true"
          >
            <NuxtLink
              :to="`/speakers/${speaker.speakerId}`"
              class="block"
            >
              <div class="flex gap-3 p-5 lg:flex-col lg:p-6 xl:p-9">
                <div class="relative shrink-0">
                  <NuxtImg
                    :src="speaker.avatarUrl"
                    :alt="speaker.name"
                    width="220"
                    height="314"
                    class="aspect-speaker-img-full h-[144px] w-[100px] object-cover duration-300 group-hover:grayscale-0 lg:size-full lg:grayscale"
                  />

                  <ShareGradientMask
                    class="hidden group-hover:opacity-0 lg:block"
                  />
                  <ShareNoiseMask
                    class="hidden group-hover:opacity-0 lg:block"
                  />
                </div>

                <div>
                  <h3 class="text-h4-24 leading-[1.4]">
                    {{ speaker.name }}
                  </h3>
                  <p
                    class="text-xs leading-[1.4] text-webconf-gray-500 group-hover:text-white"
                  >
                    {{ speaker.JobTitle }}
                  </p>
                </div>
              </div>
            </NuxtLink>

            <ul
              class="relative mx-5 mb-5 mt-0 flex grow flex-wrap items-start gap-2 lg:mx-6 lg:mb-6 xl:mx-9 xl:mb-9"
            >
              <li
                v-for="tag in speaker.tags"
                :key="`${speaker.name}-${tag}`"
              >
                <button
                  type="button"
                  class="relative border border-webconf-blue px-4 py-[6px] text-xs leading-[1.4] tracking-[0.02em] transition-colors duration-300 group-hover:border-webconf-gray hover:border-webconf-blue hover:bg-white hover:text-webconf-blue"
                  @click="handleTagClick(tag)"
                >
                  {{ tag }}
                </button>
              </li>
            </ul>

            <template #floating-block>
              <ClientOnly>
                <ShareFloatingBlock />
              </ClientOnly>
            </template>
          </ShareGridCard>
        </div>
      </section>
    </main>

    <!-- 講者資訊彈跳視窗 -->
    <NuxtPage />
  </div>
</template>

<style scoped>
/* 淡入淡出效果 */
.speakers-fade-enter-active,
.speakers-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.speakers-fade-enter-from,
.speakers-fade-leave-to {
  opacity: 0;
}

.speakers-fade-enter-to,
.speakers-fade-leave-from {
  opacity: 1;
}

.speakers-fade-move {
  transition: opacity 0.3s ease-in-out;
}
</style>

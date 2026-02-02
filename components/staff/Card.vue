<script setup lang="ts">
import type { Staff } from '~/types'

defineProps<{
  staff: Staff
}>()
</script>

<template>
  <ShareGridCard
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

        <ShareGradientMask class="hidden group-hover:opacity-0 lg:block" />
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
</template>

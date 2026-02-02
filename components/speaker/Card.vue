<script setup lang="ts">
import type { AgendaTag, Speaker } from '~/types'

defineProps<{
  speaker: Speaker
  isSelected: boolean
  selectedTags: AgendaTag[]
}>()

const emit = defineEmits<{
  tagClick: [tag: AgendaTag]
}>()
</script>

<template>
  <ShareGridCard
    :is-selected="isSelected"
    :show-square="false"
    :fill-effect="true"
  >
    <NuxtLink
      v-cursor="{
        scale: 0.5,
        duration: 0.5,
      }"
      :to="`/speakers/${speaker.speakerId}`"
      class="flex gap-3 p-5 lg:flex-col lg:p-6 xl:p-9"
    >
      <div class="relative shrink-0">
        <NuxtImg
          :src="speaker.avatarUrl"
          :alt="speaker.name"
          width="220"
          height="314"
          class="aspect-speaker-img-full h-[144px] w-[100px] object-cover duration-300 group-hover:grayscale-0 lg:size-full lg:grayscale"
        />

        <ShareGradientMask class="hidden group-hover:opacity-0 lg:block" />
        <ShareNoiseMask class="hidden group-hover:opacity-0 lg:block" />
      </div>

      <div class="flex flex-col gap-3">
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

        <ul class="relative flex grow flex-wrap items-start gap-2">
          <li
            v-for="tag in speaker.tags"
            :key="`${speaker.name}-${tag}`"
          >
            <button
              type="button"
              :class="{
                'border-webconf-gray bg-webconf-gray text-webconf-blue':
                  selectedTags.includes(tag),
              }"
              class="relative border border-webconf-blue px-4 py-[6px] text-xs leading-[1.4] tracking-[0.02em] transition-colors duration-300 group-hover:border-webconf-gray hover:border-webconf-blue hover:bg-white hover:text-webconf-blue"
              @click.stop.prevent="emit('tagClick', tag)"
            >
              {{ tag }}
            </button>
          </li>
        </ul>
      </div>
    </NuxtLink>

    <template #floating-block>
      <ClientOnly>
        <ShareFloatingBlock />
      </ClientOnly>
    </template>
  </ShareGridCard>
</template>

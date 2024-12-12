<script setup lang="ts">
import { socialIconMap } from '~/constants'
import type { SocialLink, SocialLinkType } from '~/types/common'

defineProps<{
  socialLinks: SocialLink[]
}>()

function getSocialIcon(type: SocialLinkType) {
  return socialIconMap[type]
}
</script>

<template>
  <ul class="flex gap-x-2">
    <li
      v-for="link in socialLinks"
      :key="link.type"
      class="group relative size-12 bg-primary-green/10"
    >
      <div
        class="absolute left-1 top-1 size-[10px] border-l border-t border-primary-green transition-all duration-150 lg:group-hover:left-0 lg:group-hover:top-0"
      ></div>
      <div
        class="absolute right-1 top-1 size-[10px] border-r border-t border-primary-green transition-all duration-150 lg:group-hover:right-0 lg:group-hover:top-0"
      ></div>
      <div
        class="absolute bottom-1 right-1 size-[10px] border-b border-r border-primary-green transition-all duration-150 lg:group-hover:bottom-0 lg:group-hover:right-0"
      ></div>
      <div
        class="absolute bottom-1 left-1 size-[10px] border-b border-l border-primary-green transition-all duration-150 lg:group-hover:bottom-0 lg:group-hover:left-0"
      ></div>

      <NuxtLink
        external
        :to="link.url"
        :title="link.type"
        target="_blank"
        class="relative flex size-full items-center justify-center"
      >
        <Icon
          :name="getSocialIcon(link.type)"
          size="24"
          class="text-primary-green"
        />
        <span class="sr-only">{{ link.type }}</span>
      </NuxtLink>
    </li>
  </ul>
</template>

<style scoped></style>

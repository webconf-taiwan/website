<script lang="ts" setup>
import { historyLinks } from '~/constants'

const { navLinks } = defineProps<{
  navLinks: {
    name: string
    href: string
    engName: string
  }[]
}>()
</script>

<template>
  <div
    data-lenis-prevent
    class="drawer-content mb-10 min-h-[20dvh] flex-1 px-10 lg:px-10"
  >
    <ul class="mt-1 space-y-5 border-l border-dashed border-primary-green text-justify leading-7 tracking-wide">
      <li
        v-for="(link) in navLinks"
        :key="link.name"
      >
        <NuxtLink
          v-if="link.name !== '歷屆'"
          :to="link.href"
          class="flex items-center space-x-4 py-3 pl-6"
        >
          <p class="text-mina h-[1.45rem] text-xl font-bold">
            {{ link.engName }}
          </p>
          <p class="font-bold">
            {{ link.name }}
          </p>
        </NuxtLink>

        <div
          v-else
          class="space-y-4 py-3 pl-6"
        >
          <div class="flex items-center space-x-4">
            <p class="text-mina h-[1.45rem] text-xl font-bold">
              {{ link.engName }}
            </p>
            <p class="font-bold">
              {{ link.name }}
            </p>
          </div>

          <ul class="flex space-x-4">
            <li
              v-for="historyLink in historyLinks"
              :key="historyLink.name"
            >
              <NuxtLink
                :to="historyLink.href"
                target="_blank"
                class="flex items-center justify-center border border-primary-green px-3 py-[2px] text-lg active:bg-primary-green/50"
              >
                {{ historyLink.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </div>
</template>

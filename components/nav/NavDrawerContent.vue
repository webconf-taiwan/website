<script lang="ts" setup>
const { navLinks } = defineProps<{
  navLinks: {
    name: string
    href: string
    engName: string
  }[]
}>()

const emit = defineEmits(['navigate'])

function directToAnotherPage(href: string) {
  emit('navigate', href)
}
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
          type="button"
          class="flex items-center space-x-4 py-3 pl-6"
          @click="directToAnotherPage(link.href)"
        >
          <p class="text-mina text-xl font-bold">
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
            <p class="text-mina text-xl font-bold">
              {{ link.engName }}
            </p>
            <p class="font-bold">
              {{ link.name }}
            </p>
          </div>

          <ul class="flex space-x-4">
            <li>
              <NuxtLink
                to="https://2013.webconf.tw/"
                target="_blank"
                class="flex items-center justify-center border border-primary-green px-3 py-[2px] text-lg active:bg-primary-green/50"
              >
                2013
              </NuxtLink>
            </li>

            <li>
              <NuxtLink
                to="https://2023.webconf.tw/"
                target="_blank"
                class="flex items-center justify-center border border-primary-green px-3 py-[2px] text-lg active:bg-primary-green/50"
              >
                2023
              </NuxtLink>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </div>
</template>

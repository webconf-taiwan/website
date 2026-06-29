<script setup>
const config = useRuntimeConfig()
const route = useRoute()
const open = ref(false)

const links = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
]

function isActive (href) {
  if (href === '/') return route.path === '/'

  return route.path.startsWith(href)
}

watch(() => route.path, () => {
  open.value = false
})
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-gray-200 bg-white">
    <div class="container flex items-center justify-between gap-4 py-4 lg:py-6">
      <NuxtLink to="/" class="text-zh-head-5 shrink-0 font-medium text-txt-dark">
        {{ config.public.APP_TITLE }}
      </NuxtLink>

      <ul class="hidden flex-wrap items-center md:flex">
        <li v-for="link in links" :key="link.href">
          <AtomButton
            :href="link.href"
            intent="link"
            :class="isActive(link.href) ? 'text-brand' : ''"
          >
            {{ link.label }}
          </AtomButton>
        </li>
      </ul>

      <button
        type="button"
        class="flex size-10 items-center justify-center rounded-md text-txt-dark md:hidden"
        :aria-expanded="open"
        aria-label="切換選單"
        @click="open = !open"
      >
        <span class="relative block h-3 w-5">
          <span
            class="absolute left-0 top-0 block h-0.5 w-full bg-current transition"
            :class="open ? 'translate-y-[5px] rotate-45' : ''"
          ></span>
          <span
            class="absolute bottom-0 left-0 block h-0.5 w-full bg-current transition"
            :class="open ? '-translate-y-[6px] -rotate-45' : ''"
          ></span>
        </span>
      </button>
    </div>

    <div v-show="open" class="border-t border-gray-100 bg-white md:hidden">
      <ul class="container flex flex-col py-4">
        <li v-for="link in links" :key="link.href">
          <NuxtLink
            :to="link.href"
            class="text-zh-body-1 block py-3 transition"
            :class="isActive(link.href) ? 'text-brand' : 'text-txt-dark hover:text-brand'"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </header>
</template>

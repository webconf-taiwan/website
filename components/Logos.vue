<template>
  <div class="grid grid-cols-3 place-content-center gap-x-2 md:grid-cols-[repeat(5,_minmax(100px,_auto))]">
    <NuxtLink
      class="my-link flex flex-col items-center px-4 py-2"
      to="https://nuxt.com/"
      target="_blank"
    >
      <img
        src="/icon-nuxt.svg"
        class="inline-block size-16"
      >
      <span class="text-green-500">Nuxt 3</span>
    </NuxtLink>
    <NuxtLink
      class="my-link flex flex-col items-center px-4 py-2"
      href="https://vitejs.dev/"
      target="_blank"
    >
      <img
        src="/icon-vite.svg"
        class="size-16 p-2"
      >
      <span class="text-purple-500">Vite</span>
    </NuxtLink>
    <NuxtLink
      class="my-link flex flex-col items-center px-4 py-2"
      href="https://tailwindcss.com/"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src="/icon-tailwindcss.svg"
        class="size-16 p-1"
      >
      <span class="text-cyan-500">TailwindCSS</span>
    </NuxtLink>
    <NuxtLink
      class="my-link flex flex-col items-center px-4 py-2"
      href="https://pinia.vuejs.org/"
      target="_blank"
    >
      <img
        src="/icon-pinia.svg"
        class="size-16 p-1"
      >
      <span class="text-yellow-500 dark:text-yellow-200">Pinia</span>
    </NuxtLink>
    <NuxtLink
      class="my-link flex flex-col items-center px-4 py-2"
      href="https://vueuse.org/"
      target="_blank"
    >
      <img
        src="/icon-vueuse.svg"
        class="size-16 p-1"
      >
      <span class="text-emerald-500">VueUse</span>
    </NuxtLink>
  </div>
</template>

<script setup>
// 頁面 meta 資料
useHead({
  title: 'Home - Nuxt App',
  meta: [
    {
      name: 'description',
      content: 'Welcome to our modern Nuxt 3 application',
    },
  ],
})
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600"
  >
    <div class="text-center text-white">
      <h1 class="mb-4 text-4xl font-bold">
        Welcome to Nuxt App
      </h1>
      <p class="mb-8 text-lg">
        A modern web application built with Nuxt 3
      </p>
      <div class="space-x-4">
        <button
          class="rounded-lg bg-white px-6 py-2 text-blue-500 transition hover:bg-gray-100"
        >
          Get Started
        </button>
        <button>
          class="rounded-lg border border-white px-6 py-2 text-white transition
          hover:bg-white hover:text-blue-500" Learn More
        </button>
      </div>
    </div>
  </div>
</template>

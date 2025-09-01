<script setup>
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
    </div>
  </div>
</template>

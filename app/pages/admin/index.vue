<script setup>
definePageMeta({ layout: 'admin', middleware: 'admin' })

useSeoMeta({
  title: 'Dashboard · WebConf 後台',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="container py-8">
    <header class="border-b border-gray-300 pb-6">
      <h1 class="text-h4 text-txt-dark">
        Dashboard
      </h1>
    </header>

    <section class="mt-8">
      <p class="text-body-sm text-txt-light">
        後台骨架先到這裡——實際要管理的內容（報名、投稿、票券⋯）之後再加。
      </p>
    </section>
  </div>
</template>

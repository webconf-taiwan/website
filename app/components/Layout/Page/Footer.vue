<script setup>
const config = useRuntimeConfig()
const year = new Date().getFullYear()

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
]

const socialLinks = [
  { label: 'Instagram', href: '#' },
  { label: 'Facebook', href: '#' },
  { label: 'GitHub', href: '#' }
]
</script>

<template>
  <footer class="mt-20 border-t border-gray-200 bg-white">
    <div class="container py-12 md:py-16">
      <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div class="lg:col-span-2">
          <NuxtLink to="/" class="text-zh-head-4 inline-block font-medium text-txt-dark">
            {{ config.public.APP_TITLE }}
          </NuxtLink>
          <p class="text-zh-body-2 mt-6 max-w-sm text-txt-light">
            在這裡放上專案的一句話簡介。
          </p>
        </div>

        <div>
          <p class="text-zh-body-2 mb-4 uppercase tracking-widest text-txt-super-light">
            Sitemap
          </p>
          <ul class="space-y-2">
            <li v-for="link in navLinks" :key="link.href">
              <NuxtLink
                :to="link.href"
                class="text-zh-body-1 text-txt-dark transition hover:text-brand"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <p class="text-zh-body-2 mb-4 uppercase tracking-widest text-txt-super-light">
            Social
          </p>
          <ul class="flex flex-wrap gap-x-4 gap-y-2">
            <li v-for="social in socialLinks" :key="social.label">
              <a
                :href="social.href"
                target="_blank"
                rel="noopener"
                class="text-zh-body-2 text-txt-dark transition hover:text-brand"
              >
                {{ social.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-100">
      <div class="container flex flex-col items-center justify-between gap-2 py-4 md:flex-row md:py-6">
        <p class="text-zh-mini text-txt-super-light">
          © {{ year }} {{ config.public.APP_TITLE }}. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

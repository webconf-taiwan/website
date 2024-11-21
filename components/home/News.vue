<script lang="ts" setup>
import { accupassLink, contactInfos } from '@/constants'
</script>

<template>
  <section class="py-20 lg:flex lg:justify-center lg:py-[160px]">
    <div class="w-full lg:max-w-[648px]">
      <div class="w-full">
        <NuxtImg
          src="/logo-full-sm.svg"
          alt="news"
          class="w-full"
        />
      </div>

      <div class="mt-10 flex flex-col items-center justify-center lg:mt-[52px]">
        <Button
          as-child
          variant="custom"
          size="custom"
        >
          <NuxtLink
            external
            :to="accupassLink"
            target="_blank"
            class="text-xl"
          >
            <span>前往購票</span>
          </NuxtLink>
        </Button>

        <p class="mb-[10rem] mt-4">
          敬請關注 <NuxtLink
            external
            :to="contactInfos[1].href"
            target="_blank"
            aria-label="Facebook"
            class="lg:hover:text-primary-green lg:hover:underline"
          >
            Facebook
          </NuxtLink>
          最新消息
        </p>
      </div>
    </div>
  </section>
</template>

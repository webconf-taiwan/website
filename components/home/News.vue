<script lang="ts" setup>
import { accupassLink } from '~/constants'
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
          type="button"
          variant="custom"
          size="custom"
        >
          <NuxtLink
            :to="accupassLink"
            target="_blank"
            class="text-xl"
          >
            即將開賣
          </NuxtLink>
        </Button>

        <p class="mt-4">
          敬請關注 Facebook 最新消息
        </p>
      </div>
    </div>
  </section>
</template>

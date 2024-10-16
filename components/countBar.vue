<script lang="ts" setup>
import { useDateCountdown } from '@/composables/useCountDown'
import { accupassLink } from '@/constants'

const { remainingTime } = useDateCountdown()
</script>

<template>
  <div class="fixed inset-x-0 bottom-0 z-50 w-full bg-black/80 px-5 py-3 md:px-0 md:py-3">
    <div class="flex items-center justify-center space-x-3 md:space-x-8">
      <div class="flex flex-col md:flex-row md:space-x-3">
        <span class="ml-[-9px] font-bold text-primary-green">【即將開放報名】</span>
        <span class="font-bold">{{ remainingTime.days }} 天 {{ remainingTime.hours }} 時 {{ remainingTime.minutes }} 分 {{ remainingTime.seconds }} 秒</span>
      </div>
      <Button
        as-child
        variant="custom"
        size="footerBar"
      >
        <NuxtLink
          :to="accupassLink"
          target="_blank"
          class="text-base"
        >
          <span>前往購票</span>
        </NuxtLink>
      </Button>
    </div>
  </div>
</template>

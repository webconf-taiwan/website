<script setup lang="ts">
</script>

<template>
  <section class="h-[calc(100dvh-72px)] max-h-[720px]">
    <SectionTitle class="mb-8 justify-center lg:mb-14">
      <template #title>
        SPONSOR
      </template>
      <template #subTitle>
        贊助
      </template>
    </SectionTitle>

    <div class="flex flex-col items-center justify-center gap-x-10 gap-y-8 lg:flex-row">
      <img
        src="/cube.svg"
        alt="cube"
        class="order-2 w-[clamp(262px,_50dvw,_400px)] shrink-0 lg:order-1 lg:w-[clamp(220px,_50dvw,262px)]"
      >

      <div class="order-1 flex max-w-[520px] flex-col gap-y-5 lg:order-2 lg:max-w-[340px]">
        <p class="text-center text-xl font-bold leading-8 tracking-wide lg:text-left">
          非常感謝以下企業或個人贊助，讓 WebConf Taiwan 2024 可以有更多資源來籌劃整個活動！
        </p>
        <p class="text-center text-xl font-bold tracking-wide text-primary-green lg:text-left lg:text-[2rem]">
          誠摯邀請成為贊助夥伴
        </p>
        <Button
          as-child
          variant="custom"
          size="custom"
          rounded="none"
          class="max-lg:mx-auto"
        >
          <NuxtLink
            to="/sponsors"
            target="_blank"
            class="text-xl"
            aria-label="前往諮詢"
          >
            <span>前往諮詢</span>
          </NuxtLink>
        </Button>
      </div>
    </div>
  </section>
</template>

<style scoped></style>

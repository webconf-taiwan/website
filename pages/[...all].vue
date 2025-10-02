<script setup lang="ts">
useSeoMeta({
  title: '404 找不到此頁面',
})
</script>

<template>
  <div
    class="grid flex-1 place-content-stretch pb-0 pt-[129px] sm:place-content-center sm:pb-[131px] sm:pt-[147px]"
  >
    <ShareGradientDotsCard
      class="w-full px-5 pb-[125px] pt-10 sm:w-[640px] sm:px-[60px] sm:py-12"
    >
      <div class="flex flex-col items-center">
        <!-- 標題 -->
        <div class="w-fit py-[6px]">
          <h2 class="flex px-10 pb-4 text-h3-40 text-webconf-gray">
            404
          </h2>
          <div class="flex items-center pb-20 sm:pb-[60px]">
            <span class="size-3 bg-webconf-gray"></span>
            <span class="h-[1px] flex-1 bg-webconf-gray"></span>
            <span class="size-3 bg-webconf-gray"></span>
          </div>
        </div>
        <!-- 內文 -->
        <p class="pb-[60px] text-h4-24 text-webconf-gray sm:pb-20">
          找不到此頁面
        </p>
        <!-- 返回首頁按鈕 -->
        <ShareLinkButton to="/">
          返回首頁
        </ShareLinkButton>
      </div>
    </ShareGradientDotsCard>
  </div>
</template>

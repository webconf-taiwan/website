<template>
  <ShareGradientDotsCard
    class="fixed left-1/2 top-1/2 z-[100] w-[640px] -translate-x-1/2 -translate-y-1/2 text-center text-white"
  >
    <div class="mx-auto inline-block py-[6px]">
      <h2 class="mx-10 flex text-h3-40">
        About
      </h2>
      <div class="mt-4 flex items-center">
        <span class="size-3 bg-white"></span>
        <span class="h-[1px] flex-1 bg-white"></span>
        <span class="size-3 bg-white"></span>
      </div>
    </div>

    <p class="mt-8 text-body-16">
      WebConf
      是一年一度聚集網頁技術專家與愛好者的盛會。今年以「連結」為主題，聚焦在人與人、人與
      AI，以及人與網路之間的互動。我們將回顧網頁技術的關鍵演進，並探討 AI
      與機器學習如何優化體驗，行動優化與響應式設計的重要性，以及最新產業趨勢。WebConf
      不僅是專業知識的分享平台，更是交流與靈感激盪的舞台，邀你一同探索網頁未來的無限可能。
    </p>

    <NuxtLink
      to="/"
      class="mt-[60px] inline-block w-[200px] bg-white py-4 text-btn-14 text-black"
    >
      議程資訊
    </NuxtLink>
  </ShareGradientDotsCard>
</template>

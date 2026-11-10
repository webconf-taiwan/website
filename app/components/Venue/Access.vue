<script setup>
// 場域頁第二區「Taipei Popop」交通方式，放在 CommonPlatePage 的右欄。
// 左欄（卷號 PL. IV / II. / ACCESS）與桌機的菌落粒子由 CommonPlatePage 負責，同講者／議程頁。
defineProps({
  data: { type: Object, required: true },
})

const sectionRef = ref(null)
useFadeIn(sectionRef, { step: 0.08 })
</script>

<template>
  <section ref="sectionRef" aria-labelledby="venue-access-heading" class="relative mx-5 flex flex-col pt-8 lg:mx-0 lg:pl-6 lg:pt-0">
    <div class="flex flex-col gap-2 lg:gap-4">
      <h2 id="venue-access-heading" data-fade="in" class="text-en-h1 italic text-pre-800">{{ data.title_en }}</h2>
      <p data-fade="in" class="text-zh-h4 text-pre-800">{{ data.title_zh }}</p>
    </div>

    <dl class="mt-6 flex max-w-[650px] flex-col gap-6 lg:mt-8 lg:gap-8">
      <div v-for="transport in data.transports" :key="transport.title" data-fade="in" class="flex flex-col gap-2">
        <dt class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span class="font-en-serif text-[24px] font-normal italic leading-[1.2] tracking-[0.02em] text-accent-1 lg:text-[28px]">{{ transport.title }}</span>
          <span class="text-zh-body-md font-medium text-pre-800">{{ transport.label }}</span>
        </dt>
        <dd class="text-zh-body-lg text-pre-800/[62%]">
          <p>{{ transport.description }}</p>
          <ul v-if="transport.items?.length" class="mt-1 flex flex-col">
            <li v-for="item in transport.items" :key="item" class="flex gap-2 pl-2">
              <span aria-hidden="true">・</span><span>{{ item }}</span>
            </li>
          </ul>
        </dd>
      </div>
    </dl>

    <!-- 窄視窗沒有側欄菌落粒子：設計稿手機版在區塊底部的 120px 留白裡放一張菌落圖
         （x 42、緊接在文字下方、325×310 只露出上段、不透明度 90%），不另外佔高度 -->
    <div aria-hidden="true" class="pointer-events-none absolute left-[22px] top-[calc(100%+2px)] h-[118px] w-[325px] overflow-hidden lg:hidden">
      <picture data-fade="in" class="block">
        <source :srcset="assetUrl('/figma/venue/access-colonies.webp')" type="image/webp">
        <img
          :src="assetUrl('/figma/venue/access-colonies.png')" alt="" width="325" height="310"
          loading="lazy" decoding="async" draggable="false" class="block max-w-none select-none opacity-90"
        >
      </picture>
    </div>
  </section>
</template>

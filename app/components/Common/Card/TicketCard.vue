<script setup>
const props = defineProps({
  data: {
    type: Object,
  }
})
</script>

<template>
  <div class="relative border border-pre-500/50 bg-pre-800/10 backdrop-blur-md rounded p-4 md:p-8">
    <div class="flex flex-col gap-y-6 md:justify-between h-full">
      <div>
        <div class="flex flex-col gap-y-4 md:mb-8">
          <span class="text-pre-800/[62%] text-fs-meta">{{ data.code }}</span>
          <h3 class="text-pre-800 text-h3">{{ data.title }}</h3>
          <div class="flex gap-x-4 items-baseline text-fs-h5 leading-[18px]">
            <span>NT$</span>
            <span class="text-fs-h1 leading-10">{{ data.price }}</span>
            <span>元 / 人</span>
          </div>
          <p class="text-pre-800/[62%] font-serif text-fs-meta">{{ data.category }}</p>
        </div>
        <ul>
          <li
            v-for="feature in data.features"
            :key="feature.en"
            class="flex gap-x-1 py-4"
          >
            <span>+</span>
            <div class="font-serif font-bold">
              <p class="text-fs-body-sm italic">{{ feature.en }}</p>
              <p class="">{{ feature.zh }}</p>
            </div>
          </li>
        </ul>
      </div>
      <!-- <button
        type="button"
        class="flex justify-center items-center gap-x-1 lg:hidden"
      >
        <span>
          展開票券內容
        </span>
        <span>
          +
        </span>
      </button> -->
      <!-- 電腦版才顯示 -->
      <div class="hidden md:flex justify-between items-center">
        <span>reserve</span>
        <button type="button">-></button>
      </div>
    </div>
  </div>
</template>

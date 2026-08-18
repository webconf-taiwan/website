<script setup>
const props = defineProps({
  data: {
    type: Object,
  }
})

const isExpanded = ref(false)
</script>

<template>
  <div
    class="relative w-full rounded p-4 backdrop-blur-md md:w-auto md:p-8"
    :class="data.is_highlighted
      ? 'border-[1.5px] border-accent-1 bg-gradient-to-b from-[#0f1d4e] to-[#0f1d4e]/30'
      : 'border border-pre-500/50 bg-pre-800/10'"
  >
    <div class="flex flex-col gap-y-6 md:justify-between h-full">
      <div>
        <div class="flex flex-col gap-y-4 md:mb-8">
          <span class="text-pre-800/[62%] text-fs-meta">{{ data.code }}</span>
          <h3 class="text-pre-800 text-h3">{{ data.title }}</h3>
          <div class="flex gap-x-4 items-baseline text-fs-h5 leading-[18px]">
            <span>NT$</span>
            <span class="text-fs-h1 leading-10">{{ data.price }}</span>
            <span>{{ data.unit }}</span>
          </div>
          <p class="text-pre-800/[62%] font-serif text-fs-meta">{{ data.category }}</p>
        </div>
        <div
          class="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
          :class="isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] md:grid-rows-[1fr]'"
        >
          <ul class="min-h-0 overflow-hidden">
            <li
              v-for="feature in data.features"
              :key="feature.en"
              class="grid grid-cols-[20px_1fr] gap-x-1 border-b border-dashed border-pre-800/35 py-4"
            >
              <span class="font-mono leading-[1.4] text-accent-1">+</span>
              <div class="font-serif font-bold">
                <p class="text-fs-body-sm italic">{{ feature.en }}</p>
                <p class="">{{ feature.zh }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <button
        type="button"
        class="flex items-center justify-center gap-x-2 border-dashed border-pre-800/35 pt-4 font-zh text-fs-btn font-bold text-pre-800/[62%] md:hidden"
        :class="isExpanded ? '' : 'border-t'"
        :aria-expanded="isExpanded"
        @click="isExpanded = !isExpanded"
      >
        <span>{{ isExpanded ? '收合票券內容' : '展開票券內容' }}</span>
        <span class="font-mono">{{ isExpanded ? '-' : '+' }}</span>
      </button>
      <!-- 電腦版才顯示 -->
      <div class="hidden md:flex justify-between items-center">
        <span>reserve</span>
        <button
          type="button"
          class="flex size-6 items-center justify-center transition-colors"
          :class="data.is_highlighted ? 'text-accent-1' : 'text-pre-800/[62%]'"
        >
          <AtomIcon name="arrow-right-thin" class="h-[5px] w-3" />
        </button>
      </div>
    </div>
  </div>
</template>

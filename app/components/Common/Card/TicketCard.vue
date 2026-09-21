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
    class="group relative w-full rounded p-4 backdrop-blur-md transition-[background-color,background-image] duration-300 md:p-8"
    :class="data.is_highlighted
      ? 'border-[1.5px] border-accent-1 bg-[#0a0a0c] bg-gradient-to-b from-[#0f1d4e] to-[#0f1d4e]/30 hover:bg-[linear-gradient(180deg,#1d327c_0%,rgba(29,50,124,0.3)_100%),linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2))]'
      : 'border border-pre-800/50 bg-bg-light/10 hover:bg-bg-light/20'"
  >
    <div class="flex flex-col gap-y-6 md:justify-between h-full">
      <div>
        <div class="flex flex-col gap-y-4 md:mb-8">
          <span class="text-pre-800/[62%] text-micro">{{ data.code }}</span>
          <h3 class="text-pre-800 text-zh-h3">{{ data.title }}</h3>
          <div class="flex gap-x-4 items-baseline">
            <span class="text-zh-h5">NT$</span>
            <span class="text-en-h1 italic">{{ data.price }}</span>
            <span class="text-zh-body-md">{{ data.unit }}</span>
          </div>
          <p class="text-pre-800/[80%] font-en-serif text-meta">{{ data.category }}</p>
        </div>
        <div
          class="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
          :class="isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] md:grid-rows-[1fr]'"
        >
          <ul class="min-h-0 overflow-hidden">
            <li
              v-for="feature in data.features"
              :key="feature.en"
              class="flex items-start gap-x-1 border-b border-dashed border-pre-800/35 py-4"
            >
              <AtomIcon name="plus" class="size-5 text-accent-1" />
              <div class="text-pre-800">
                <p class="text-en-caption italic">{{ feature.en }}</p>
                <p class="text-zh-body-lg">{{ feature.zh }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <button
        type="button"
        class="relative z-1 flex items-center justify-center gap-x-2 border-dashed border-pre-800/35 pt-4 text-zh-btn text-pre-800/[62%] md:hidden"
        :class="isExpanded ? '' : 'border-t'"
        :aria-expanded="isExpanded"
        @click="isExpanded = !isExpanded"
      >
        <span>{{ isExpanded ? '收合票券內容' : '展開票券內容' }}</span>
        <span class="font-mono">{{ isExpanded ? '-' : '+' }}</span>
      </button>
      <!-- 購票連結（電腦版才顯示）。
           ⚠️ 整條都是連結，不是只有箭頭 —— 原本箭頭是個沒綁事件的 <button>，
           點了不會有任何反應，而且命中區只有那顆 24px 的圖示。
           負 margin 是把命中區撐大到卡片內距的邊緣，同時用 px-2 抵銷掉、文字位置不變。
           hover 的顏色變化交給整張卡的 group（見外層 div），不是這條連結自己。 -->
      <NuxtLink
        v-if="data.reserve_link?.href"
        :href="data.reserve_link.href"
        :target="data.reserve_link.target"
        :rel="linkRel(data.reserve_link.target)"
        class="-mx-2 hidden items-center justify-between gap-x-2 rounded px-2 py-2 md:flex"
      >
        <span class="transition-colors text-zh-btn duration-300 group-hover:text-accent-1">{{ data.reserve_link.label }}</span>
        <span class="flex size-6 items-center justify-center text-pre-800/[62%] transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-accent-1">
          <AtomIcon name="arrow-right-thin" class="size-6" />
        </span>
      </NuxtLink>
    </div>

    <!-- 手機版：整張卡就是購票連結。
         桌機不需要（上面那條 reserve 已經夠好按），所以 md 以上收起來。
         ⚠️ 這層鋪滿整張卡，所以「展開票券內容」那顆要 relative z-1 浮在它上面，
         不然點展開會變成跳去購票頁。順序也有關係：這層放在最後，同層沒設
         z-index 的元素是後者在上，往前搬就會被卡片內容蓋掉、整層失效。 -->
    <a
      v-if="data.reserve_link?.href"
      :href="data.reserve_link.href"
      :target="data.reserve_link.target"
      :rel="linkRel(data.reserve_link.target)"
      :aria-label="`${data.title} — ${data.reserve_link.label}`"
      class="absolute inset-0 md:hidden"
    ></a>
  </div>
</template>

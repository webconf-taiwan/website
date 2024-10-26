<script lang="ts" setup>
</script>

<template>
  <div>
    <!-- 基本資訊 -->
    <div>
      <p class="text-lg md:text-[28px]">
        以 Kotlin Multiplatform 制霸全平台
      </p>

      <ul class="mt-2 space-y-2 text-primary-green md:flex md:space-x-10 md:space-y-0">
        <li class="flex items-center gap-x-1">
          <Icon
            name="ic:round-access-time"
            size="20"
          />
          <p>8/12 (sat.) 09:00~09:50</p>
        </li>
        <li class="flex items-center gap-x-1">
          <Icon
            name="heroicons:map-pin"
            size="20"
          />
          <p>i 棟</p>
        </li>
      </ul>
    </div>

    <!-- 議程介紹 -->
    <div class="mt-4">
      <p>多年技術社群志工，積極參與 Kotlin User Group 運作，並建立 Kotlin 讀書會/練功場等活動。目前在 JetBrains 擔任技術傳教士，負責推廣 IDE 工具及技術。平時醉心於技術研究，期待能將複雜的技術名詞用通俗易懂的方式讓人人都能吸收。工作之餘是一位甜點愛好者。</p>
    </div>

    <!-- 議程標籤 -->
    <div class="mt-4">
      <AgendaTypeTag :tags="['FRONTEND', 'BACKEND']" />
    </div>

    <!-- 目標會眾 -->
    <div class="mt-4 space-y-2 border-t pt-4">
      <p class="text-lg">
        目標會眾
      </p>
      <p>對多平台開發有興趣的開發者。</p>
    </div>
  </div>
</template>

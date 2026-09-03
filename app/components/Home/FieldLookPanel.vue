<script setup>
// ?mode=tool 的效果切換面板。首頁的兩張粒子場共用（HomeParticleField 與
// HomeField），所以抽成獨立元件 —— 兩邊各留一份複本遲早會走鐘。
//
// 這個元件只管顯示與發事件，不碰引擎；真正的切換邏輯在各自的 Field 裡，
// 因為換效果要重建目標點、重取樣圖片，那些是各版本自己的事。
//
// teleport 到 body 是為了不被首頁那層 relative 的 stacking context 綁住。
// 呼叫端用 v-if 控制顯示，而那個旗標要等 onMounted 讀完網址才會是 true，
// 所以 SSR 不會輸出它，也就不會有 hydration 落差。

defineProps({
  // PARTICLE_FIELD_LOOKS 的其中一筆（目前這組）
  look: { type: Object, required: true },
  // 可選清單，依 index 排好
  looks: { type: Array, required: true },
  // true = 網址指定的，false = 這次隨機抽到的
  pinned: { type: Boolean, default: false },
  // 「維持開場構圖」的力度百分比
  holdPct: { type: Number, default: 100 },
  // 切換中（重生成粒子要一兩秒）→ 按鈕先禁用，避免連點疊在一起
  switching: { type: Boolean, default: false },
})

defineEmits(['pick', 'hold'])
</script>

<template>
  <Teleport to="body">
    <aside
      class="fixed right-3 top-1/2 z-50 w-[15.5rem] max-w-[calc(100vw-1.5rem)] -translate-y-1/2 rounded-2xl border border-white/15 bg-black/80 p-3 text-[#efe6d2] backdrop-blur-md"
      aria-label="Hero 粒子效果切換"
    >
      <p class="px-1 font-mono text-fs-micro uppercase text-white/45">
        Hero Animation
      </p>

      <ul class="mt-2 space-y-1">
        <li>
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/10"
            :class="!pinned ? 'bg-white/15' : ''"
            :disabled="switching"
            @click="$emit('pick', null)"
          >
            <span class="w-3 font-mono text-fs-micro text-white/40">↻</span>
            <span class="text-fs-body-sm">隨機</span>
            <span
              v-if="!pinned"
              class="ml-auto font-mono text-fs-micro text-white/45"
            >{{ look.index }}</span>
          </button>
        </li>

        <li
          v-for="item in looks"
          :key="item.id"
        >
          <button
            type="button"
            class="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/10"
            :class="pinned && look.id === item.id ? 'bg-white/15' : ''"
            :disabled="switching"
            @click="$emit('pick', item.index)"
          >
            <span class="mt-0.5 w-3 font-mono text-fs-micro text-white/40">{{ item.index }}</span>
            <span class="min-w-0">
              <span class="block truncate text-fs-body-sm">{{ item.name }}</span>
              <span class="block font-mono text-fs-micro text-white/35">
                {{ item.rules.preset }} · {{ item.rules.seedPattern }}
              </span>
            </span>
          </button>
        </li>
      </ul>

      <!-- 維持開場構圖的力度。0 = 完全放手（規則想怎麼演就怎麼演），
           100 = 照該組設定，200 = 握到接近鎖死。 -->
      <div class="mt-3 border-t border-white/10 px-1 pt-3">
        <label class="flex items-baseline justify-between font-mono text-fs-micro uppercase text-white/45">
          <span>維持開場構圖</span>
          <span class="text-white/70">{{ holdPct }}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="200"
          step="5"
          :value="holdPct"
          class="mt-2 w-full accent-white/80"
          @input="$emit('hold', Number($event.target.value))"
        >
        <p class="mt-1 font-mono text-fs-micro leading-relaxed text-white/30">
          grip {{ Math.round(look.hold.grip * holdPct / 100) }}
        </p>
      </div>

      <p class="mt-2 border-t border-white/10 px-1 pt-2 font-mono text-fs-micro leading-relaxed text-white/35">
        ?hero-animation={{ look.index }}
      </p>
    </aside>
  </Teleport>
</template>

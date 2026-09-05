<script setup>
// 互動模式的確認窗。
//
// ⚠️ 相機權限一定要等使用者按下確認才要 —— 頁面一載入就跳權限視窗是很糟的體驗，
// 而且瀏覽器會記住「拒絕」，之後就再也問不到了。

const { isAsking, lastError, confirm, close, scrollToField } = useInteractiveMode()
const lenis = useLenis()

function start () {
  // ⚠️ confirm() 要先跑。捲動只是附帶的體驗，包在前面的話它一出事
  // （lenis 還沒 ready、scrollTo 參數不合）整個互動模式就開不起來了。
  confirm()
  // 捲回 PL.I：粒子滿版的那一格才推得動
  try {
    scrollToField(lenis)
  } catch (err) {
    console.warn('[InteractiveGate] 捲回頂端失敗，不影響互動模式', err)
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isAsking"
      class="fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-6 backdrop-blur-[24px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interactive-gate-title"
      @click.self="close"
    >
      <div class="w-full max-w-[420px] border border-accent-1/60 bg-[#0a0a0c]/90 p-8 backdrop-blur-md">
        <p class="font-mono text-[12px] leading-[1.2] tracking-[0.2em] text-accent-1">
          EASTER EGG
        </p>

        <h2
          id="interactive-gate-title"
          class="mt-3 font-serif text-[32px] font-bold italic leading-[1.2] text-pre-800"
        >
          啟動互動模式
        </h2>

        <div class="mt-5 flex flex-col gap-3 font-Noto text-[15px] leading-[1.7] text-pre-800/80">
          <p>開啟相機後，可以用手勢直接撥動畫面上的粒子。畫面會先回到頂端 —— 那裡的粒子是滿版的，推起來最明顯。</p>
          <ul class="flex flex-col gap-2 border-y border-dashed border-pre-800/35 py-4">
            <li class="flex gap-x-3">
              <span class="shrink-0 font-serif italic text-accent-1">張開手掌</span>
              <span class="text-pre-800/70">推開粒子，張得越開推得越遠</span>
            </li>
            <li class="flex gap-x-3">
              <span class="shrink-0 font-serif italic text-accent-1">捏合手指</span>
              <span class="text-pre-800/70">把粒子吸過來，捏越緊吸力越強</span>
            </li>
            <li class="flex gap-x-3">
              <span class="shrink-0 font-serif italic text-accent-1">握拳</span>
              <span class="text-pre-800/70">放手，可以換個位置再來</span>
            </li>
          </ul>
          <p class="text-pre-800/60">
            影像只在你的瀏覽器裡運算，不會上傳。隨時按 Esc 離開。
          </p>
        </div>

        <p v-if="lastError" class="mt-4 font-mono text-[12px] tracking-[0.1em] text-[#ff6b6b]">
          {{ lastError }}
        </p>

        <div class="mt-7 flex items-center justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 font-Noto text-[15px] text-pre-800/60 transition-colors hover:text-pre-800"
            @click="close"
          >
            取消
          </button>
          <button
            type="button"
            class="border border-accent-1 bg-accent-1/10 px-6 py-2 font-Noto text-[15px] font-medium tracking-[0.1em] text-pre-800 transition-colors hover:bg-accent-1/20"
            @click="start"
          >
            開啟相機
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

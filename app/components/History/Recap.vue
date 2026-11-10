<script setup>
defineProps({ data: { type: Object, required: true } })
const rootRef = ref(null)
const playing = ref(false)
useFadeIn(rootRef)
</script>

<template>
  <section ref="rootRef" class="history-recap relative mx-auto max-w-[1440px]" aria-labelledby="history-recap-heading">
    <HistoryRibbon variant="video" class="video-ribbon hidden lg:block" />
    <div class="recap-content relative mx-auto">
      <h2 id="history-recap-heading" data-fade="in" class="recap-label flex flex-wrap items-center gap-x-2 gap-y-1 text-meta">
        <span>WebConf Taiwan</span><span class="text-accent-1" aria-hidden="true">·</span>
        <span>{{ data.year }}</span><span class="text-accent-1" aria-hidden="true">·</span><span>完整活動回顧</span>
      </h2>
      <div data-fade="in" class="recap-frame">
        <div class="recap-media relative">
          <iframe v-if="playing" :src="data.embed_url" title="WebConf Taiwan 2025 完整活動回顧影片" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" />
          <button v-else type="button" class="recap-play group relative block w-full" aria-label="播放 WebConf Taiwan 2025 完整活動回顧影片" @click="playing = true">
            <img :src="assetUrl(data.poster)" alt="2025 WebConf 活動回顧影片" width="872" height="489" loading="lazy" decoding="async">
            <span class="play-icon absolute left-1/2 top-1/2 flex size-[60px] -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-pre-800/35 bg-bg-mid text-pre-800 transition-colors group-hover:border-accent-1 group-hover:text-accent-1 group-focus-visible:border-accent-1 group-focus-visible:text-accent-1">
              <svg class="h-7 w-6" viewBox="0 0 24 28" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round">
                <path d="M2 2 L22 14 L2 26 Z" />
              </svg>
            </span>
          </button>
        </div>
      </div>
      <a v-if="playing" :href="data.href" target="_blank" rel="noopener noreferrer" class="mt-3 inline-block text-en-caption underline underline-offset-4">在 YouTube 觀看 ↗</a>
    </div>
  </section>
</template>

<style scoped>
.history-recap { padding: 80px 16px 40px; }
.recap-content { max-width: 890px; }
.recap-label { padding: 0 4px; margin-bottom: 8px; }
.recap-frame { padding: 4px; border: 1px solid rgb(239 230 210 / 35%); background: rgb(10 10 12 / 70%); }
.recap-media { aspect-ratio: 2880 / 1616; }
.recap-play img { display: block; width: 100%; height: auto; aspect-ratio: 2880 / 1616; object-fit: cover; filter: brightness(0.6); transition: filter 180ms ease-out; }
.recap-play:focus-visible img { filter: brightness(1); }
@media (hover: hover) { .recap-play:hover img { filter: brightness(1); } }
.recap-media iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.recap-play:focus-visible { outline: 2px solid theme('colors.accent.1'); outline-offset: 4px; }
@media (min-width: 1024px) {
  .history-recap { min-height: 720px; padding: 81px 60px 106px; }
  .recap-label { padding-inline: 8px; margin-bottom: 12px; line-height: 14px; }
  .recap-frame { padding: 8px; }
  .recap-media, .recap-play img { aspect-ratio: 872 / 489; }
  .video-ribbon { top: 189.43px; left: 50%; transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) { .play-icon, .recap-play img { transition: none; } }
</style>

<script setup>
defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  mobileTitle: { type: String, default: '' },
  subtitle: { type: String, required: true },
  plate: { type: Object, required: true },
  items: { type: Array, default: () => [] },
  columns: { type: Number, default: 2 },
})
</script>

<template>
  <section :id="id" class="sponsor-group" :aria-labelledby="`${id}-title`">
    <CommonPlate :data="plate" :divider="false" class="sponsor-group-plate" />
    <div class="sponsor-group-content">
      <div class="sponsor-group-heading">
        <h2 :id="`${id}-title`" class="sponsor-group-title text-en-h1 italic">
          <template v-if="mobileTitle"><span class="lg:hidden">{{ mobileTitle }}</span><span class="hidden lg:inline">{{ title }}</span></template>
          <template v-else>{{ title }}</template>
        </h2>
        <p class="text-zh-h4">{{ subtitle }}</p>
      </div>
      <slot>
        <div class="sponsor-group-cards" :class="{ 'sponsor-group-cards--three': columns === 3 }">
          <SponsorsCard v-for="item in items" :key="item.id" :data="item" />
        </div>
      </slot>
    </div>
  </section>
</template>

<style scoped>
.sponsor-group { position: relative; min-width: 0; width: 100%; border-top: 1px solid rgb(239 230 210 / 35%); }
.sponsor-group :deep(.sponsor-group-plate) { padding: 24px 0 0; align-items: flex-end; }
.sponsor-group-content { display: flex; flex-direction: column; align-items: center; gap: 24px; padding-top: 32px; }
.sponsor-group-heading { display: flex; flex-direction: column; gap: 8px; width: 100%; text-align: center; }
/* 字級沿用 text-en-h1 的 40–64px 伸縮值，避免在平板斷點突然放大。 */
.sponsor-group-title { line-height: 1.2; font-weight: 400; letter-spacing: 0.02em; overflow-wrap: normal; }
.sponsor-group-cards { display: grid; grid-template-columns: minmax(0, 1fr); gap: 24px; width: 100%; max-width: 424px; align-items: start; }

@media (min-width: 768px) {
  .sponsor-group-cards { max-width: 872px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (min-width: 768px) and (max-width: 1279px) {
  /* 主辦單位在中尺寸先排兩欄，單獨一張置中，保留介紹的閱讀寬度。 */
  .sponsor-group-cards--three :deep(.sponsor-card:last-child:nth-child(odd)) { grid-column: 1 / -1; justify-self: center; width: calc((100% - 24px) / 2); }
}

@media (min-width: 1024px) {
  .sponsor-group :deep(.sponsor-group-plate) { position: absolute; top: 0; left: 0; padding-top: 32px; align-items: flex-start; }
  .sponsor-group-content { gap: 40px; }
  .sponsor-group-heading { gap: 16px; padding: 0 140px; }
  .sponsor-group-cards { align-items: stretch; }
}

@media (min-width: 1280px) {
  .sponsor-group-cards--three { max-width: none; grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>

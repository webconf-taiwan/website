<script setup>
defineProps({
  items: { type: Array, default: () => [] },
})
</script>

<template>
  <SponsorsGroup v-if="items.length" id="passion-supporters" title="Passion Sponsor" subtitle="熱情贊助" :plate="{ code: 'PL. V', number: 'V.', label: 'PASSION SPONSOR' }">
    <ul class="passion-sponsors" aria-label="熱情贊助名單">
      <li v-for="item in items" :key="item.id" data-fade="in" class="passion-sponsor">
        <component :is="item.link?.href ? 'a' : 'span'" :href="item.link?.href" :target="item.link?.target" :rel="linkRel(item.link?.target)" class="passion-sponsor-content">
          <img v-if="item.logo" :src="item.logo" :alt="item.name" :width="item.logo_width || 150" :style="{ '--sponsor-logo-width': `${item.logo_width || 150}px` }" loading="lazy" decoding="async">
          <span v-else class="text-zh-h3">{{ item.name }}</span>
        </component>
      </li>
    </ul>
  </SponsorsGroup>
</template>

<style scoped>
.passion-sponsors { display: grid; width: 100%; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.passion-sponsor { display: flex; justify-content: center; min-width: 0; min-height: 120px; }
.passion-sponsor-content { display: flex; align-items: center; justify-content: center; width: 100%; text-align: center; overflow-wrap: anywhere; }
.passion-sponsor img { width: var(--sponsor-logo-width); max-width: 100%; height: auto; object-fit: contain; }
.passion-sponsor a:focus-visible { outline: 1px solid currentColor; outline-offset: 4px; }

@media (min-width: 768px) {
  .passion-sponsors { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
}

@media (min-width: 1280px) {
  .passion-sponsors { grid-template-columns: repeat(5, minmax(0, 1fr)); max-width: 1096px; }
}
</style>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})

const item = computed(() => props.data || {})
const skills = computed(() => item.value.skills || [])
const itemRef = ref(null)
useFadeIn(itemRef, { step: 0.06 })
</script>

<template>
  <article
    ref="itemRef"
    class="agenda-item relative flex h-[145px] w-full flex-col justify-center py-4 pl-2 pr-2 lg:h-auto lg:pr-4 lg:py-6"
  >
    <div class="agenda-item-content flex w-full flex-col gap-y-3 lg:flex-row lg:gap-x-6">
      <div class="flex min-w-0 flex-1 flex-col gap-y-2">
        <p data-fade="in" class="hidden text-micro text-pre-800/[62%] lg:mb-2 lg:block">
          {{ item.code }}
        </p>

        <h2 data-fade="in" class="text-zh-h3 text-pre-800">
          {{ item.title }}
        </h2>

        <ul data-fade="in" class="flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-body-sm text-pre-800/[62%]">
          <li v-for="skill in skills" :key="skill">
            #{{ skill }}
          </li>
        </ul>
      </div>

      <div class="agenda-item-speaker flex h-10 w-full shrink-0 flex-col justify-end gap-y-1 lg:h-auto lg:w-[200px] lg:gap-y-2">
        <p data-fade="in" class="text-zh-h5 text-accent-1">
          {{ item.speaker_name }}
        </p>
        <p data-fade="in" class="font-mono text-[12px] font-normal leading-[1.2] tracking-[0.2em] text-pre-800/[62%]">
          {{ item.speaker_title }}
        </p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.agenda-item::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  border-top: 1px dashed rgb(239 230 210 / 35%);
  pointer-events: none;
}
@media (min-width: 1024px) {
  .agenda-item h2 { line-height: 1.1875; }
  .agenda-item-content > div:first-child > p { line-height: 14px; }
}
@media (min-width: 1024px) and (hover: hover) {
  .agenda-item { transition: padding-left 250ms ease; }
  .agenda-item:hover {
    padding-left: 24px;
    background-image: linear-gradient(to right, rgb(15 29 78 / 80%), rgb(15 29 78 / 30%) 65.385%, rgb(15 29 78 / 10%));
  }
}
@media (max-width: 1023px) {
  .agenda-item {
    height: auto;
    /* 組與組間距 24px：上下各 12px，虛線落在正中間。 */
    padding-top: 12px;
    padding-bottom: 12px;
    justify-content: flex-start;
    border: 0;
    background: none;
  }

  .agenda-item::after,
  .agenda-item:first-child::before {
    content: '';
    position: absolute;
    right: 0;
    left: 0;
    border-top: 1px dashed rgb(239 230 210 / 20%);
  }
  .agenda-item::after { bottom: 0; }
  .agenda-item:first-child::before { top: 0; }

  .agenda-item-content { gap: 8px; }
  .agenda-item h2 {
    overflow-wrap: anywhere;
  }

  .agenda-item ul {
    height: auto;
    min-height: 20px;
    gap: 8px;
    overflow: visible;
  }
  .agenda-item li { max-width: 100%; overflow-wrap: anywhere; }

  .agenda-item-speaker { height: auto; }
  .agenda-item-speaker > p:last-child {
    overflow-wrap: anywhere;
  }
}
</style>

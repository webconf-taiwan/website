<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})

const item = computed(() => props.data || {})
const skills = computed(() => item.value.skills || [])
</script>

<template>
  <article
    class="relative flex h-[145px] w-full flex-col justify-center border-b border-dashed border-pre-800/35 py-4 pl-2 pr-2 lg:h-auto lg:gap-y-4 lg:pr-4 lg:py-6"
    :class="item.is_highlighted
      ? 'bg-gradient-to-r from-[#0f1d4e]/80 via-[#0f1d4e]/30 via-[65.385%] to-[#0f1d4e]/10 lg:pl-6'
      : 'pl-2 lg:pl-2'"
  >
    <div class="flex w-full flex-col gap-y-3 lg:flex-row lg:gap-x-6">
      <div class="flex min-w-0 flex-1 flex-col gap-y-2 lg:gap-y-4">
        <p class="hidden font-mono text-fs-meta uppercase text-pre-800/[62%] lg:block">
          {{ item.code }}
        </p>

        <h2 class="font-zh text-[22px] font-bold leading-[1.25] text-pre-800 lg:text-fs-h3 lg:leading-[1.2]">
          {{ item.title }}
        </h2>

        <ul class="flex h-5 flex-wrap items-center gap-x-3 overflow-hidden font-mono text-fs-meta text-accent-1 lg:h-auto lg:gap-x-4">
          <li v-for="skill in skills" :key="skill">
            #{{ skill }}
          </li>
        </ul>
      </div>

      <div class="flex h-10 w-full shrink-0 flex-col justify-end lg:h-auto lg:w-[200px]">
        <p class="font-zh text-fs-body font-bold leading-[1.35] text-pre-800 lg:text-fs-h5 lg:leading-[1.35]">
          {{ item.speaker_name }}
        </p>
        <p class="font-zh text-fs-caption leading-[1.45] text-pre-800/[62%] lg:text-fs-body-sm">
          {{ item.speaker_title }}
        </p>
      </div>
    </div>
  </article>
</template>

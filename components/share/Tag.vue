<script setup lang="ts">
interface Props {
  size?: ['xl', 'md', 'lg'][number]
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const tagClass = computed(() => {
  return `tag-${props.size}`
})
</script>

<template>
  <span
    :class="tagClass"
    class="inline-block bg-webconf-blue text-btn-14 font-semibold text-webconf-gray"
  >
    <slot></slot>
  </span>
</template>

<style>
.tag-md {
  @apply px-5 py-2;
}

.tag-lg {
  @apply px-4 py-2 sm:px-6;
}

.tag-xl {
  @apply px-10 py-2;
}
</style>

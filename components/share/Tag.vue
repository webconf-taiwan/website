<script setup lang="ts">
interface Props {
  size?: ['md', 'lg'][number]
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const tagClass = computed(() => {
  return props.size === 'md' ? 'tag-md' : 'tag-lg'
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
  @apply px-10 py-2;
}
</style>

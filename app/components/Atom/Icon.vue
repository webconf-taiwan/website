<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  isFull: {
    type: Boolean,
    default: false
  }
})

const { name } = toRefs(props)

const svgName = computed(() => {
  return name.value.includes('/') ? `#${name.value}` : `#/${name.value}`
})
</script>

<template>
  <svg
    :width="isFull ? '100%' : 24"
    :height="isFull ? '100%' : 24"
    aria-hidden="true"
  >
    <use :xlink:href="svgName" fill="currentColor" />
  </svg>
</template>

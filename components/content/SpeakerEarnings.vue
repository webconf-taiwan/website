<template>
  <div
    v-if="$slots.expectedEarnings"
    class="custom-ul-style mb-10 text-body-16 text-webconf-gray lg:mb-0"
  >
    <slot name="expectedEarnings"></slot>
  </div>
</template>

<style scoped>
.custom-ul-style :deep(ul, ol) {
  list-style-type: disc;
  margin-left: 1.5rem;
}

.custom-ul-style :deep(ol) {
  list-style-type: auto;
  margin-left: 1.5rem;
}
</style>

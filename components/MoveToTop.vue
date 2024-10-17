<script setup lang="ts">
const { overTop = 0 } = defineProps<{
  overTop?: number
}>()

const { y: windowY } = useWindowScroll()
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <button
      v-if="windowY >= overTop"
      type="button"
      class="flex size-10 items-center justify-center bg-primary-green transition-opacity duration-300"
      style="clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 12px 100%, 0% calc(100% - 12px));"
      @click="() => console.log('click')"
    >
      <Icon
        name="i-heroicons-arrow-small-up"
        class="text-black"
        size="24"
      />
    </button>
  </Transition>
</template>

<style scoped></style>

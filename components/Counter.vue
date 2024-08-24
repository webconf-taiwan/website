<script setup lang="ts">
const counterStore = useCounterStore()

const { count } = storeToRefs(counterStore)
const { increment, decrement } = counterStore
</script>

<template>
  <div class="flex items-center justify-center gap-x-4">
    <button
      type="button"
      class="inline-block rounded-full bg-teal-600 hover:bg-teal-700"
      @click="decrement"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 16 16"
      ><path
        fill="currentColor"
        d="M3 8a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 3 8Z"
      /></svg>
    </button>
    <div class="font-mono">
      {{ count }}
    </div>
    <button
      type="button"
      class="inline-block rounded-full bg-teal-600 hover:bg-teal-700"
      @click="increment"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
      ><path
        fill="currentColor"
        d="M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z"
      /></svg>
    </button>
  </div>
</template>

<style scope></style>

<script setup lang="ts">
const _ = defineEmits<{
  next: () => void
  prev: () => void
}>()
</script>

<template>
  <div
    class="flex items-center gap-3 justify-self-center md:justify-self-start"
  >
    <button
      type="button"
      class="flex size-10 items-center justify-center border border-white text-center text-white duration-300 hover:border-webconf-blue hover:bg-webconf-blue"
      @click="$emit('next')"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.6667 19L4 12M4 12L10.6667 5M4 12L20 12"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <button
      type="button"
      class="flex size-10 items-center justify-center border border-white text-center text-white duration-300 hover:border-webconf-blue hover:bg-webconf-blue"
      @click="$emit('prev')"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13.3333 5L20 12M20 12L13.3333 19M20 12L4 12"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>

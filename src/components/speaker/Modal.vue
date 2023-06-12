<template>
  <div>
    <button
      @click="open"
      class="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
    >
      打開
    </button>
    <div
      v-if="isOpened"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60"
    >
      <div class="p-4 bg-white rounded-lg modal-container">
        <button
          @click="close"
          class="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
        >
          關閉
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const isOpened = ref(true);

function open() {
  isOpened.value = true;
}

function close() {
  isOpened.value = false;
}
</script>

<style>
.modal-container {
  width: 300px;
  height: 200px;
}
</style>

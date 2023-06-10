<template>
  <div>
    <button
      @click="openModal"
      class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      打开模态框
    </button>
    <div
      v-if="isModalOpen"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60"
    >
      <div class="modal-container bg-white rounded-lg p-4">
        <!-- 在这里放置模态框的内容 -->
        <button
          @click="closeModal"
          class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          关闭模态框
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isModalOpen = ref(true);

function openModal() {
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}
</script>

<style>
.modal-container {
  width: 300px;
  height: 200px;
}
</style>

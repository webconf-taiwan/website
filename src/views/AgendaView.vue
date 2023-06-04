<template>
  <p>議程頁面</p>
</template>

<style scoped>
</style>

<script setup>
import { ref, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import { usePageInfoStore } from '@/stores/pageInfo';

const route = useRoute(); // 取得路由資訊

const pageInfoStore = usePageInfoStore();
const { setCurrentPageName } = pageInfoStore;

onMounted(() => {
  // 設定當前路由名稱
  setCurrentPageName(route.name);
});

</script>
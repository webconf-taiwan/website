<template>
  <div class="h-screen mainWidth">
    <iframe src="../../2013/index.html" width="100%" height="100%"></iframe>
  </div>
</template>

<style scoped>
.mainWidth {
  width: 100vw;
}

@media (min-width: 768px) {
  .mainWidth {
    width: calc(100vw - 60px);
  }
}
</style>

<script setup>
import { onMounted } from 'vue';
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

<template>
  <p>議程頁面</p>
</template>

<style scoped></style>

<script setup>
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { usePageInfoStore } from "@/stores/pageInfo";

const route = useRoute();

const pageInfoStore = usePageInfoStore();
const { setCurrentPageName } = pageInfoStore;

onMounted(() => {
  setCurrentPageName(route.name);
});
</script>

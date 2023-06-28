<template>
  <div v-if="isOpen" class="text-white relative z-10">
    123333333333333333333333333333333333333333333333333333333333
  </div>
</template>

<style scoped></style>

<script setup>
import { storeToRefs } from "pinia";
import { useFilterStore } from "@/stores/filter";

const filterStore = useFilterStore();
const { isOpen } = storeToRefs(filterStore);
// const { closeFilter } = filterStore;
</script>

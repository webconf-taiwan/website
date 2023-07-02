<template>
  <a href="#" @click.prevent="openFilter" class="block md:hidden">
    <div
      class="relative flex flex-col items-center justify-center w-10 h-10 border border-custom-teal-500 bg-custom-gray-800"
    >
      <div class="w-9 h-9 bg-cover filterIcon"></div>
    </div>
  </a>
</template>

<style scoped>
.filterIcon {
  background-image: url("@/assets/images/icon/ic_filter_l.svg");
}
</style>

<script setup>
import { useFilterStore } from "@/stores/filter";

const filterStore = useFilterStore();
const { openFilter } = filterStore;
</script>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { usePageInfoStore } from "@/stores/pageInfo";
import { useFilterStore } from "@/stores/filter";

const pageInfoStore = usePageInfoStore();
const { currentPageName } = storeToRefs(pageInfoStore);

const filterStore = useFilterStore();
const { filterPage, options } = storeToRefs(filterStore);
const { toggleTag } = filterStore;

const specialFilter = ref();
</script>

<template>
  <div v-if="currentPageName === 'speaker' || currentPageName === 'agenda'" ref="specialFilter" class="hidden md:block md:sticky md:top-4 md:z-20">
    <div
      class="w-full md:w-[600px] md:m-auto px-4 pt-4 pb-[6px] bg-custom-gray-800 border-t border-b md:border-r md:border-l md:rounded border-custom-teal-700 relative z-20"
    >
      <ul class="flex flex-wrap justify-center">
        <li
          v-for="tag in options"
          :key="tag"
          class="border border-custom-teal-500 rounded-md bg-custom-gray-800 text-custom-teal-500 mr-[10px] mb-[10px]"
          :class="{ optionActive: filterPage[currentPageName][tag] }"
        >
          <a
            href="#"
            class="flex items-center justify-between px-2 py-1 transition-all duration-300 rounded-md hover:bg-custom-teal-700"
            @click.prevent="toggleTag(currentPageName, tag)"
            >{{ tag }}
          </a>
        </li>
      </ul>
    </div>
    <div
      class="w-[93%] md:w-[558px] h-8 bg-custom-gray-800 border border-custom-teal-700 rounded opacity-60 relative bottom-7 left-1/2 transform -translate-x-1/2"
    ></div>
    <div
      class="w-[88%] md:w-[528px] h-8 bg-custom-gray-800 border border-custom-teal-700 rounded opacity-30 relative bottom-[56px] left-1/2 transform -translate-x-1/2"
    ></div>
  </div>
</template>

<style scoped>
.closeMenuIcon {
  background-image: url("@/assets/images/icon/ic_close_l.svg");
}

.optionActive {
  background: #006a97;
}
</style>

<template>
  <div
    v-if="isOpen"
    class="bg-drop-blur fixed inset-0 flex items-end i-center z-50 backdrop-blur-sm bg-custom-teal-700 bg-opacity-50 max-h-screen"
    @wheel="preventScroll"
  >
    <div class="border-t-2 border-custom-teal-700 bg-custom-gray-800 w-full flex justify-between items-center p-3">
      <ul class="flex flex-wrap gap-2 mr-3">
        <li
          v-for="tag in options"
          :key="tag"
          class="border border-custom-teal-500 rounded-md bg-custom-gray-800 text-custom-teal-500"
          :class="{ optionActive: filterPage[currentPageName][tag] }"
        >
          <a
            href="#"
            class="flex justify-between items-center py-1 px-2 rounded-md transition-all duration-300 hover:bg-custom-teal-700"
            @click.prevent="toggleTag(currentPageName, tag)"
            >{{ tag }}
          </a>
        </li>
      </ul>
      <a href="#" class="closeMenuIcon w-10 h-10 flex-shrink-0 self-start" @click.prevent="closeFilter"></a>
    </div>
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

<script setup>
import { storeToRefs } from "pinia";
import { usePageInfoStore } from "@/stores/pageInfo";
import { useFilterStore } from "@/stores/filter";

const pageInfoStore = usePageInfoStore();
const { currentPageName } = storeToRefs(pageInfoStore);

const filterStore = useFilterStore();
const { isOpen, filterPage, options } = storeToRefs(filterStore);
const { closeFilter, toggleTag } = filterStore;

const preventScroll = (event) => {
  event.preventDefault();
  event.stopPropagation();
};
</script>

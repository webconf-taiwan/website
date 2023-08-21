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

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-end max-h-screen bg-opacity-50 bg-drop-blur i-center backdrop-blur-sm bg-custom-teal-700"
    @wheel="preventScroll"
  >
    <div class="flex items-center justify-between w-full p-3 border-t-2 border-custom-teal-700 bg-custom-gray-800">
      <ul class="flex flex-wrap gap-2 mr-3">
        <li
          v-for="tag in options"
          :key="tag"
          class="border rounded-md border-custom-teal-500 bg-custom-gray-800 text-custom-teal-500"
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
      <a href="#" class="self-start flex-shrink-0 w-10 h-10 closeMenuIcon" @click.prevent="closeFilter"></a>
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

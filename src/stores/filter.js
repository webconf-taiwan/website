import { defineStore } from "pinia";

export const useFilterStore = defineStore("filter", {
  state: () => ({
    isOpen: false,
    filter: {
      speaker: {},
      agenda: {},
    },
  }),
  actions: {
    openFilter() {
      this.isOpen = true;
    },
    closeFilter() {
      this.isOpen = false;
    },
  },
});

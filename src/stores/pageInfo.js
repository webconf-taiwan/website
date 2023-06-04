import { defineStore } from 'pinia'

export const usePageInfoStore = defineStore('pageInfo', {
  state: () => ({
    currentPageName: "home",
  }),
  actions: {
    setCurrentPageName(name) {
      this.currentPageName = name;
      console.log(this.currentPageName);
    }
  }
});
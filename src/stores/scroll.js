import { defineStore } from 'pinia';

export const useScrollStore = defineStore('scroll', {
  state: () => ({
    currentSpiderNum: 0,
    isClicking: false,
    scrollIntoViewFn: null,
    toggleSpiderLineHeightFn: null,
  }),
  actions: {
    setSpiderLocation(num) {
      this.currentSpiderNum = num;
    },
  },
});

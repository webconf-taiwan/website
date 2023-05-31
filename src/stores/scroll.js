import { defineStore } from 'pinia'

export const useScrollStore = defineStore('scroll', {
  state: () => ({
    currentSpiderNum: 0,
    isClicking: false,
  }),
  actions: {
    setSpiderLocation(num) {
      this.currentSpiderNum = num;
    }
  }
});

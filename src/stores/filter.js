import { defineStore } from "pinia";

export const useFilterStore = defineStore("filter", {
  state: () => ({
    isOpen: false,
    filterPage: {
      speaker: {},
      agenda: {},
    },
    filterOptions: {
      speaker: [],
      agenda: [],
    },
    options: ["Frontend", "Backend", "UI / UX", "Agile", "DevOps", "Security", "團隊管理"],
  }),
  actions: {
    openFilter() {
      this.isOpen = true;
      document.body.style.overflow = "hidden";
    },

    closeFilter() {
      this.isOpen = false;
      document.body.style.overflow = "auto";
    },

    toggleTag(currentPageName, tag) {
      this.filterPage[currentPageName][tag] = !this.filterPage[currentPageName][tag];
      this.filterTag(currentPageName);
    },

    filterTag(currentPageName) {
      this.filterOptions[currentPageName] = Object.keys(this.filterPage[currentPageName]).filter(
        (key) => this.filterPage[currentPageName][key]
      );
    },

    isShowSpeaker(categoryTags) {
      if (!this.filterOptions.speaker.length) {
        return true;
      }
      return categoryTags.some((tag) => this.filterOptions.speaker.includes(tag));
    },

    isShowAgenda(categoryTags) {
      if (!this.filterOptions.agenda.length) {
        return true;
      }
      return categoryTags.some((tag) => this.filterOptions.agenda.includes(tag));
    },

    initializeObj() {
      for (let i = 0; i < this.options.length; i += 1) {
        const item = this.options[i];
        this.filterPage.speaker[item] = false;
        this.filterPage.agenda[item] = false;
      }
    },
  },
});

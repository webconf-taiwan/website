<template>
  <div class="bg-container">
    <div :class="{ bgImage: currentPageName !== '2013WebConf' }">
      <div
        v-if="currentPageName !== 'home' && currentPageName !== '2013WebConf'"
        class="bg-gradient"
      ></div>
    </div>
    <Header ref="header" v-if="header"></Header>
    <router-view />
    <Footer ref="footer" v-if="footer"></Footer>
  </div>
</template>

<style scoped>
.bg-container {
  position: relative;
  overflow: hidden;
}

.bgImage {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url("@/assets/images/bg_m.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.bg-gradient {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(360deg, rgba(11, 20, 32, 0.6) 0%, rgba(11, 20, 32, 0) 100%);
}

@media (min-width: 768px) {
  .bgImage {
    background-image: url("@/assets/images/bg.png");
  }
}
</style>

<script setup>
import Header from "@/components/HeaderComponent.vue";
import Footer from "@/components/FooterComponent.vue";
// import { RouterLink, RouterView } from 'vue-router';
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { usePageInfoStore } from "@/stores/pageInfo";
import { useFilterStore } from "@/stores/filter";

const pageInfoStore = usePageInfoStore();
const { currentPageName } = storeToRefs(pageInfoStore);

const filterStore = useFilterStore();
const { initializeObj } = filterStore;

const header = ref(false);
const footer = ref(false);

onMounted(() => {
  initializeObj();
  setTimeout(() => {
    header.value = true;
    footer.value = true;
  }, 100);
});
</script>

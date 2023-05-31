<template>
<div class="bgImage bg-no-repeat bg-center bg-fixed bg-cover">
  <Header ref="header" v-if="header"></Header>
  <router-view/>
  <Footer ref="footer" v-if="footer">></Footer>
</div>

</template>

<style scoped>
.bgImage {
  background-image: url('src/assets/images/bg_m.png');
}
@media (min-width: 768px) {
  .bgImage {
  background-image: url('src/assets/images/bg.png');
  }
}
</style>

<script setup>
import Header from "@/components/HeaderComponent.vue";
import Footer from "@/components/FooterComponent.vue";
// import { RouterLink, RouterView } from 'vue-router';
import { ref, onMounted } from 'vue';

const header = ref(false);
const footer = ref(false);

onMounted(() => {
  setTimeout(() => {
    header.value = true;
    footer.value = true;
  }, 100);
})

</script>
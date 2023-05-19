<template>
  <Header @scrollIntoView="scrollIntoView"></Header>
  <router-view/>
</template>

<style scoped>
</style>

<script setup>
import Header from "@/components/HeaderComponent.vue"
// import { RouterLink, RouterView } from 'vue-router';
import { ref } from 'vue';
const home = ref()

const scrollIntoView = (num) => {
  home.value.scrollIntoView(num);
}


</script>
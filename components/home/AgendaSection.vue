<script setup lang="ts">
import cubeAnimation from '~/assets/lottie/cube_animation.json'
</script>

<template>
  <div class="bg-black">
    <h2>AGENDA</h2>

    <HomeAgendaCubeAnimation
      :animation-data="cubeAnimation"
      :loop="true"
      :autoplay="true"
      :speed="1"
      height="400px"
      width="400px"
    />
  </div>
</template>

<style scope></style>

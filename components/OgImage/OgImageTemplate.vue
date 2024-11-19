<script setup lang="ts">
defineProps<{
  title: string
  description: string
  author: string
  location: string
  date: string
  startTime: string
  endTime: string
}>()
</script>

<template>
  <!-- eslint-disable -->
  <div class="wrapper">
    <img
      class="background"
      src="/og-image-bg.svg"
    >

    <div class="container">
      <div class="logo-container">
        <img class="logo" src="/logo-full-sm.svg">
      </div>
      <div class="title">{{ title }}</div>
      <div class="description">{{ description }}</div>
      <div class="author">— {{ author }}</div>
    </div>

    <div class="information">
      <div class="location">{{ location }} 棟</div>
      <div class="agenda-datetime">
        <span>{{ date }} /</span>
        <span>{{ startTime }} - {{ endTime }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.background {
  position: absolute;
  width: 1200px;
  height: 630px;
  top: 0;
}

.container {
  padding: 48px 120px;
}

.logo-container {
  width: 480px;
  height: 75px;
  margin-bottom: 24px;
}

.logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.title {
  color: hsla(168, 100%, 50%, 1);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  font-weight: bold;
  font-size: 64px;
  line-height: 1.2;
  margin-bottom: 16px;
}

.description {
  color: white;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  font-size: 28px;
  margin-bottom: 16px;
}

.author {
  text-align: right;
  margin-left: auto;
  margin-right: 16px;
  font-size: 48px;
  color: hsla(168, 100%, 50%, 1);
}

.information {
  position: absolute;
  bottom: 48px;
  left: 120px;
  color: white;
  font-family: "Mina", "Noto Sans TC", sans-serif;
}

.location {
  font-size: 40px;
}

.agenda-datetime {
  display: flex;
  flex-direction: row;
  column-gap: 16px;
  justify-content: flex-start;
  font-size: 32px;
}
</style>

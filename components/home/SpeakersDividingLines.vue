<template>
  <div
    class="grid-speakers-separator-line left-0"
  ></div>
  <div
    class="grid-speakers-separator-line left-1/2 sm:left-1/3"
  ></div>
  <div
    class="grid-speakers-separator-line hidden sm:left-2/3 sm:block"
  ></div>
</template>

<style scoped>
.grid-speakers-separator-line {
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background-image: linear-gradient(to bottom, var(--primary-green), var(--primary-green) 4px, transparent 4px, transparent 8px);
  background-repeat: repeat;
  background-size: 100% 8px;
}
</style>

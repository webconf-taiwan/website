<template>
  <div class="flex flex-col items-end">
    <div class="titleDecoration w-20 h-6"></div>
    <div class="text-center bg-custom-gray-800 border border-custom-teal-500 py-2 px-5 mt-1">
      <h2 class="text-custom-teal-500 font-medium text-3xl whitespace-nowrap md:text-5xl">
        <slot></slot>
      </h2>
    </div>
  </div>
</template>

<style scoped>
.titleDecoration {
  background: url('@/assets/images/title_display.svg') no-repeat;
}
</style>

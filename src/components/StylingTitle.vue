<template>
  <div class="flex flex-col items-end">
    <div class="w-20 h-6 titleDecoration"></div>
    <div class="px-5 py-2 mt-1 text-center border bg-custom-gray-800 border-custom-teal-500">
      <h2 class="text-3xl font-medium text-custom-teal-500 whitespace-nowrap md:text-5xl">
        <slot></slot>
      </h2>
    </div>
  </div>
</template>

<style scoped>
.titleDecoration {
  background: url("@/assets/images/title_display.svg") no-repeat;
}
</style>

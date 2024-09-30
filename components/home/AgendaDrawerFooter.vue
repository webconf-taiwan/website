<template>
  <div class="space-y-2">
    <div class="flex h-3 justify-center space-x-1.5">
      <span
        v-for="(_, index) in 6"
        :key="index"
        class="h-full w-[2px] bg-primary-green"
      ></span>
    </div>

    <div class="w-full border-t border-primary-green"></div>
  </div>
</template>

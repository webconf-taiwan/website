<template>
  <div class="py-1 border border-custom-teal-500 bg-custom-gray-800 flex">
    <div class="w-5 border-t border-b border-r border-custom-teal-700 my-1 py-1">
      <div class="h-6px border-t border-b border-custom-teal-700"></div>
    </div>
    <p class="font-rajdhani text-custom-pink-700 font-medium mx-3"><slot></slot></p>
    <div class="border-t border-b border-l border-custom-teal-700 my-1 py-1 flex-grow">
      <div class="h-6px border-t border-b border-custom-teal-700"></div>
    </div>
  </div>
</template>

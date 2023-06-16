<template>
  <div class="flex py-1 border border-custom-teal-500 bg-custom-gray-800">
    <div class="w-5 py-1 my-1 border-t border-b border-r border-custom-teal-700">
      <div class="border-t border-b h-6px border-custom-teal-700"></div>
    </div>
    <p class="mx-3 font-medium text-custom-pink-700"><slot></slot></p>
    <div class="flex-grow py-1 my-1 border-t border-b border-l border-custom-teal-700">
      <div class="border-t border-b h-6px border-custom-teal-700"></div>
    </div>
  </div>
</template>

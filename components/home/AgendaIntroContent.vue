<template>
  <div>
    <h3 class="mb-3 font-['Mina'] text-[32px] font-bold uppercase tracking-wider text-primary-green drop-shadow-[0_0_20px_hsla(168,100%,50%,0.2)]">
      <slot name="title"></slot>
    </h3>
    <p class="border-l-4 border-l-primary-green px-5 py-1 text-justify text-base leading-6 lg:px-6">
      <slot name="description"></slot>
    </p>
  </div>
</template>

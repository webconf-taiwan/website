<template>
  <h2 class="flex items-start gap-x-2">
    <div class="w-3 translate-y-0.5 space-y-1.5">
      <span
        v-for="(_, index) in 6"
        :key="index"
        class="block h-[2px] w-full bg-primary-green"
      ></span>
    </div>

    <span class="section-title-text font-['Mina'] uppercase">
      <slot name="title"></slot>
    </span>

    <span class="text-xl tracking-wider lg:text-2xl">
      <slot name="subTitle"></slot>
    </span>
  </h2>
</template>

<style scoped>
.section-title-text {
  font-size: clamp(3rem, 8vw, 92px);
  font-weight: bold;
  color: hsla(0, 0%, 85%, 0.1);
  letter-spacing: 0.05em;
  line-height: 1;
  -webkit-text-stroke: 1px white;
}
</style>

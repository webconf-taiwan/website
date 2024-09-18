<script lang="ts" setup>
const { reverse } = defineProps<{
  reverse?: boolean
}>()
</script>

<template>
  <div>
    <NuxtMarquee
      :speed="80"
      :loop="0"
      :auto-fill="true"
      :direction="reverse ? 'right' : 'left'"
    >
      <span class="text-mina mr-4 bg-gradient-to-r from-[#00FFCC33] to-[#00FFCC33] bg-clip-text text-[32px] font-bold uppercase text-transparent lg:text-[80px]">
        space information
      </span>

      <span class="text-mina marquee-text-outline mr-4 text-[32px] font-bold uppercase lg:text-[80px]">
        space information
      </span>
    </NuxtMarquee>
  </div>
</template>

<style scoped>
.marquee-text-outline {
  color: transparent;
  -webkit-text-stroke: 1px rgba(0, 255, 204, 0.2);
  text-stroke: 1px rgba(0, 255, 204, 0.2);
}
</style>

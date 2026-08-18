<script setup>
defineProps({
  title: { type: String, required: false, default: 'WebConf' },
  description: { type: String, required: false }
})
</script>

<template>
  <div class="w-full h-full flex flex-col justify-between bg-black text-[#efe6d2] p-[64px]">
    <p class="text-[22px] tracking-[0.3em] uppercase opacity-60 m-0">
      WebConf · Living Specimen
    </p>

    <div class="flex flex-col gap-6">
      <h1
        class="text-[64px] font-bold leading-tight m-0 max-w-[1000px]"
        style="display: block; line-clamp: 3; text-overflow: ellipsis;"
      >
        {{ title }}
      </h1>
      <p v-if="description" class="text-[28px] leading-relaxed opacity-70 max-w-[900px] m-0">
        {{ description }}
      </p>
    </div>

    <div class="w-full h-[2px] bg-[#71c1f0] opacity-60" />
  </div>
</template>

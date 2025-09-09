<script setup lang="ts">
interface Props {
  originalIndex: number
  speakers: {
    name: string
    src: string
  }[]
}

const _ = defineProps<Props>()
</script>

<template>
  <div>
    <div class="group relative">
      <NuxtImg
        :src="speakers[index].src"
        alt="speaker"
        width="264"
        height="376"
        class="grayscale duration-300 group-hover:grayscale-0"
      />

      <!-- 藍色漸層遮罩 -->
      <div
        class="absolute inset-0 bg-gradient-to-b from-black to-webconf-blue mix-blend-plus-lighter duration-300 group-hover:opacity-0"
      ></div>

      <!-- 噪點遮罩 -->
      <div
        class="pointer-events-none absolute inset-0 duration-300 group-hover:opacity-0"
        style="
          background:
            repeating-radial-gradient(
              circle,
              rgba(0, 0, 0, 0.25) 0,
              rgba(0, 0, 0, 0.25) 1px,
              transparent 1px,
              transparent 2px
            ),
            repeating-conic-gradient(
              rgba(0, 0, 0, 0.25) 0,
              rgba(0, 0, 0, 0.25) 1deg,
              transparent 1deg,
              transparent 2deg
            );
          background-size: 10px 10px;
          mix-blend-mode: soft-light;
        "
      ></div>
    </div>

    <h3 class="mt-4 text-h4-24">
      {{ speakers[index].name }}
    </h3>
  </div>
</template>

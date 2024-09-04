<script setup lang="ts">
const tilesWrapper = ref<HTMLElement | null>(null)
const { width, height } = useElementSize(tilesWrapper)

const TILE_SIZE = 144

const columns = computed(() => Math.ceil(width.value / TILE_SIZE))
const rows = computed(() => Math.ceil(height.value / TILE_SIZE))

const tileCount = computed(() => columns.value * rows.value)
</script>

<template>
  <ClientOnly>
    <div
      id="tiles"
      ref="tilesWrapper"
      class="space-x-1 space-y-1"
    >
      <div
        v-for="(_tile, index) in tileCount"
        id="tile"
        :key="index"
        class="bg-gray-100"
      ></div>
    </div>
  </ClientOnly>

  <main class="flex flex-col items-center px-8 py-16">
    <slot></slot>
    <div class="mt-5 text-sm opacity-50">
      [ Default Layout ]
    </div>
    <Footer />
  </main>
</template>

<style scoped>
#tiles {
  height: 100%;
  position: absolute;
  z-index: -1;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(144px, 1fr));
  grid-template-rows: repeat(auto-fill, minmax(144px, 1fr));
}
</style>

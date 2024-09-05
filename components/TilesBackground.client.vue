<script setup lang="ts">
const tilesWrapper = ref<HTMLElement | null>(null)
const { width, height } = useElementSize(tilesWrapper)

const TILE_SIZE = 144

const columns = computed(() => Math.ceil(width.value / TILE_SIZE))
const rows = computed(() => Math.ceil(height.value / TILE_SIZE))

const tileCount = computed(() => columns.value * rows.value)

const tiles = ref<HTMLElement[]>([])
</script>

<template>
  <div
    id="tiles"
    ref="tilesWrapper"
    class="space-x-0.5 space-y-0.5"
  >
    <div
      v-for="(_tile, index) in tileCount"
      ref="tiles"
      :key="index"
      class="bg-gray-100"
    ></div>
  </div>
</template>

<style scope>
#tiles {
  height: 100%;
  position: absolute;
  z-index: -1;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(144px, 1fr));
  grid-template-rows: repeat(auto-fill, minmax(144px, 1fr));
}

#tiles > div {
  pointer-events: auto;
}
</style>

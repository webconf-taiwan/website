<script setup lang="ts">
const filterDrawer = useTemplateRef('filterDrawer')
</script>

<template>
  <button
    type="button"
    class="flex size-10 items-center justify-center bg-primary-green"
    style="clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 12px 100%, 0% calc(100% - 12px));"
    @click="filterDrawer?.open()"
  >
    <Icon
      name="i-heroicons-adjustments-horizontal"
      class="text-black"
      size="24"
    />
  </button>

  <Teleport to="body">
    <Drawer
      ref="filterDrawer"
      slide-direction="slide-up"
      drawer-class="py-0"
    >
      <template #custom>
        <div class="relative p-2">
          <AgendaTags class="p-2" />
        </div>
      </template>
    </Drawer>
  </Teleport>
</template>

<style scoped></style>

<script setup lang="ts">
const isOpen = defineModel<boolean>('isOpen', { required: true })

const tags = [
  'AI',
  'Frontend',
  'Backend',
  'Security',
  '軟體設計',
  '設計實務',
  '產品思維',
  '產業應用',
  '團隊管理',
  'Agile',
]
</script>

<template>
  <section
    v-show="isOpen"
    class="tag-filter-menu absolute left-0 top-0 z-50 size-full border-webconf-gray bg-black p-4 xl:w-[228px] xl:border-r xl:pl-4 2xl:w-[260px] 2xl:pl-12"
  >
    <ul>
      <li
        v-for="tag in tags"
        :key="tag"
      >
        {{ tag }}
      </li>
    </ul>
    <button @click="isOpen = false">
      Close
    </button>
  </section>
</template>

<style scoped>
.tag-filter-menu {
  background-image: url("/images/tag-filter-menu-bg.webp");
  background-position: top right;
  background-repeat: repeat-y;
}
</style>

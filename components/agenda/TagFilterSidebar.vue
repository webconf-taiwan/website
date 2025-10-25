<template>
  <aside
    class="hidden shrink-0 flex-col items-start gap-2 border-b border-r border-webconf-gray bg-black p-4 xl:flex xl:w-[228px] xl:pl-4 2xl:w-[260px] 2xl:pl-12"
  >
    <AgendaTagFilterBtn size="lg" />
    <span
      class="tag-filter-title inline-block text-left text-h4-60 text-webconf-blue"
    >
      FILTER
    </span>
  </aside>
</template>

<style scoped>
.tag-filter-title {
  writing-mode: vertical-lr;
  transform: translateX(-4px);
}
</style>

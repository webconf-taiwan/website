<template>
  <div class="mb-8 space-y-2 px-5 lg:px-10">
    <NuxtImg
      src="/drawer/drawer-top-decorate-lg.svg"
      class="hidden w-full sm:block"
    />
    <NuxtImg
      src="/drawer/drawer-top-decorate.svg"
      class="block w-full sm:hidden"
    />
    <HomeSectionTitle>
      <template #title>
        About
      </template>
      <template #subTitle>
        關於
      </template>
    </HomeSectionTitle>
  </div>
</template>

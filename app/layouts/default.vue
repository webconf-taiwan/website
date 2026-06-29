<template>
  <div class="flex min-h-screen flex-col bg-white text-txt">
    <LayoutPageHeader />
    <main class="grow">
      <slot />
    </main>
    <LayoutPageFooter />
    <div id="subField" class="relative z-[500]"></div>
    <div id="cookieField" class="relative z-[1000]"></div>
    <div id="sideField" class="relative z-[1001]"></div>
    <div id="modalsField" class="relative z-[1002]"></div>
    <div id="loadingField" class="relative z-[1005]"></div>
  </div>
</template>

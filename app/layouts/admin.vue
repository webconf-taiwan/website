<!--
  後台專用 layout，不掛公版 LayoutPageHeader / Footer——後台不是給訪客看的，
  套公版導覽列只會讓人以為還在主站。維持同一套 design token（gray-800 / brand /
  txt-*、Tailwind 字級）讓視覺上還是「同一個 WebConf」，但殼是獨立的。
-->
<template>
  <div class="min-h-screen bg-gray-100 text-txt">
    <slot />
  </div>
</template>

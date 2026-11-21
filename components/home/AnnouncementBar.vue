<!--
  2025 歷史站（2025.webconf.tw）專用的公告橫幅，整條連到最新一屆的主站。
  這個分支只部署到 2025.webconf.tw，所以不做網域判斷、直接輸出在預渲染的 HTML 裡：
  搜尋引擎讀得到這個連結，才知道 webconf.tw 是最新一屆。
  ⚠️ 不要改回瀏覽器端判斷網域再顯示：那樣 HTML 裡不會有這段，爬蟲看不到。
-->
<template>
  <a
    href="https://webconf.tw/"
    class="fixed inset-x-0 bottom-0 z-[100] flex w-[100dvw] bg-[rgba(0,0,0,0.85)]"
  >
    <div
      class="mx-auto my-3 flex flex-col items-center justify-center font-bold leading-[1.6] md:flex-row md:text-body-18"
    >
      <div
        class="ml-[-18px] w-full text-center text-webconf-gray md:ml-0 md:w-auto md:text-start"
      >
        【新頁面已釋出】
      </div>

      <div class="text-center text-white">
        WebConf 2026 即將到來，敬請期待！
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
// 只負責讓 /agenda/:speakerId 這個網址存在（直接開啟、預渲染、分享連結）。
// 彈窗改由父頁面 pages/agenda.vue 渲染，點卡片當下就能打開，不用等換頁抓完 _payload.json；
// 原因見 composables/useSpeakerDialog.ts
//
// 不要在這裡用 definePageMeta 關掉 pageTransition：子頁面的 meta 會併進整條路由，
// 最外層 NuxtPage 看到轉場設定在 /agenda 與 /agenda/:id 之間切換，會把整個父頁面拆掉重建，
// 彈窗閃一下、捲動位置也歸零
</script>

<template>
  <div hidden></div>
</template>

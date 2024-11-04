---
title: 當 Vue 與 View 分手之後⋯
date: 2024-12-28
startTime: 15:20
endTime: 16:05
location: M
tags: ['frontend']
speakerCodes: ['kuro']
---

::agenda-tabs-content
<!--議程資訊-->
#agenda
:::agenda-title
{{ $doc.title }}
:::

:::agenda-info{:date="date" :start-time="startTime" :end-time="endTime" :location="location"}
:::

<!--議程資訊(內容)-->
受到 Solid.js 與 Svelte 的啟發，Vue.js 團隊正在開發 Vue Vapor 這個令人期待的新特性，與傳統的 vDOM 渲染模式相比，Vue Vapor 目標在除去 vDOM 操作的抽象層，可望降低執行時的記憶體消耗，同時也提升執行時的效能。
<br><br>
由於 Vue 3 的核心響應式系統 @vue/reactivity 已被設計為獨立套件，這代表著開發者可以不必依靠 Vue.js 本身，甚至也能在後端的 node.js 上使用 Vue 響應式系統來進行開發。而 Vue Vapor Mode 的基礎即是從 @vue/reactivity 這個核心模組開始出發的。
<br><br>
在這場議程中，我們將探討當 @vue/reactivity 突破 Vue.js 框架的束縛之後，如何為 Vue.js 與 Vue Vapor 帶來全新的可能性。

:::agenda-content-tags
:::

---

:::agenda-title
目標會眾
:::

<!--目標會眾(內容)-->
Vue.js 開發者、JavaScript/TypeScript 開發者

<!--講者介紹-->
#speaker
<!--講者介紹(內容)-->
Vue.js Taiwan 社群主辦人。長期專注網頁前端標準技術，也多次參與技術社群分享心得。<br>
時常出現在新莊棒球場的開發者，因為休賽期間沒球看所以來參加研討會。

::

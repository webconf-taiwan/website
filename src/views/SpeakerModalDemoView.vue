<script setup>
import SpeakerModal from "@/components/speaker-modal/SpeakerModal.vue";

const speakerInfo = {
  speakerName: "范聖佑", // 講者名稱
  organization: "JetBrains", // 公司 / 組織
  jobTitle: "技術傳教士", // 職稱
  personalIntroduction:
    "多年技術社群志工，積極參與 Kotlin User Group 運作，並建立 Kotlin 讀書會/練功場等活動。目前在 JetBrains 擔任技術傳教士，負責推廣 IDE 工具及技術。平時醉心於技術研究，期待能將複雜的技術名詞用通俗易懂的方式讓人人都能吸收。工作之餘是一位甜點愛好者。", // 個人介紹
  photoURL: "https://drive.google.com/uc?export=download&id=1_RWONcrIKve_93kXVYvASlwl1d88wQvw", // 照片，至少 300x300 像素以上
  facebookProfileLink: "https://fb.me/shengyoufan", // Facebook 個人社交連結
  twitterProfileLink: "https://twitter.com/shengyou", // Twitter 個人社交連結
  otherLinks: "", // 其他連結 (ex: 個人網站 / 部落格)
  speechTopic: "一份 Zend Engine 外帶！透過 Micro 讓一次打包、多處運行變得可能", // 演講主題（35字內）
  speechSummary:
    "經過 27 年的發展，PHP 的許多部份已脫離了當初設計的使用方式，拿來寫 CLI 工具就是一個經典的例子。不過要執行 PHP 指令仍得依賴 Zend Engine，怎樣才能做到類似 Rust 或 Go 那種一次打包、多處執行的效果呢？Micro 專案給出了一個極具創意的答案：透過將 PHP 程式與輕量的 Zend Engine 打包，就能做出多個平台的 Binary 執行檔。在這場分享裡，將介紹 Micro 專案發起的緣由、底層的運作機制及可以應用的情境，並實際示範幾個應用程式打包的情境，打開大家對 PHP Runtime、應用程式打包及發佈的想像。", // 演講摘要
  categoryTags: ["Backend"], // 技術標籤
  targetAudience: "具 PHP 開發背景，想要了解 PHP 在不同面向應用可能性的開發者", // 目標會眾
  expectedBenefits: "聽完這場分享，將會對如何將 PHP 程式打包成多平台 Binary 執行檔的流程有更進一步的認識", // 預期收穫
  date: "8/12 (Sat.)", // 日期
  time: "0900~0950",
  location: "1001",
};
</script>

<template>
  <SpeakerModal :speakerInfo="speakerInfo" :isMoreInfoOpen="true" />
</template>

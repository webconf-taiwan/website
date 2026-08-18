// index-same.vue（單一 canvas 版本）專用的元件間橋接。
//
// 為什麼需要它：原版首頁裡「講者換人」是 SpeakerField.vue 自己的事 —— 那一區的
// canvas 就長在那個元件裡。單一 canvas 版本把 canvas 抽到頁面最底層（HomeSameField），
// 名單卻還在 HomeSameSpeaker 裡，兩者是兄弟元件，沒有父子關係可以傳事件。
//
// 用 provide/inject 也可以，但 useParticleStage 已經示範了「模組層級 ref = 單例」
// 的寫法，這裡沿用同一套，元件端讀起來一致。
//
// ⚠️ 模組層級狀態會跨路由存活，所以 HomeSameField 卸載時要把 swapImpl 清掉、
// speakerIndex 歸零，否則從 /index-same 離開再回來會停在上次的人。

const speakerIndex = ref(0)
// 換人動畫進行中。名單那邊用它擋住連點（粒子還在炸開就再點一次會打架）。
const speakerBusy = ref(false)
// 由 HomeSameField 註冊的實作。canvas 還沒 ready（或這個頁面沒有 field）時是 null，
// 此時 selectSpeaker 只換文字，不做粒子動畫 —— 名單本身照常可用。
const swapImpl = shallowRef(null)

export function useSameFieldBus () {
  async function selectSpeaker (i, portrait) {
    if (i === speakerIndex.value || speakerBusy.value) return
    speakerIndex.value = i          // 文字、highlight、計數立刻跟上，不等粒子
    if (!swapImpl.value) return
    speakerBusy.value = true
    try {
      await swapImpl.value(portrait)
    } finally {
      // 中途失敗也要解鎖，否則之後就再也不能換人
      speakerBusy.value = false
    }
  }

  function resetSpeakerBus () {
    swapImpl.value = null
    speakerIndex.value = 0
    speakerBusy.value = false
  }

  return { speakerIndex, speakerBusy, swapImpl, selectSpeaker, resetSpeakerBus }
}

// 首頁上不只一張粒子 canvas（背景滿版場、PL.III 講者人像…），但「同時只能有一張在跑」。
//
// 為什麼要仲裁：每張場都是幾萬顆粒子的 compute pass + HDR render pass，兩張並跑
// 直接把 fps 砍半。而且設計上也不需要 —— 講者區塊捲到畫面中央時，背景粒子已經被
// 這個區塊蓋掉大半，繼續算它是純粹的浪費。
//
// 為什麼「暫停」在畫面上看不出來：engine.pause() 只是跳過計算與渲染，canvas 會
// 保留最後一幀，所以背景不會消失、只是定格。交棒的瞬間沒有閃爍或空白。
//
// 用法：
//   const { activeStage, claimStage, releaseStage } = useParticleStage()
//   claimStage('speaker')            // 我要上台 → 其他人自己 pause
//   releaseStage('speaker')          // 我下台 → 交還給背景
//   watch(activeStage, v => engine.pause(v !== 'speaker'))

// 模組層級 ref = 全 app 單例。SSR 期間永遠是 'background'（只有 onMounted 之後的
// client 程式碼會寫入），所以不會有跨請求汙染。
const activeStage = ref('background')

export function useParticleStage () {
  function claimStage (name) {
    if (activeStage.value !== name) activeStage.value = name
  }

  // 只在「目前確實是自己在台上」時才交還。
  // ⚠️ 這個判斷不能省：ScrollTrigger 的 onLeave 與下一區塊的 onEnter 先後次序
  // 不保證，若無條件寫回 'background'，快速捲動時會把剛上台的下一張踢掉。
  function releaseStage (name, fallback = 'background') {
    if (activeStage.value === name) activeStage.value = fallback
  }

  return { activeStage, claimStage, releaseStage }
}

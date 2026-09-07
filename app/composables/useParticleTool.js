// ?tool=1 工具面板的登記處。
//
// 為什麼需要它：面板要能同時調整「畫面上現在真的活著的每一個粒子場」，而那是誰
// 依視窗寬度而定 —— 桌機是 HomeField 一張，窄視窗是 HomeMobileField ＋
// HomeSpeakerPortrait 兩張（兩個獨立引擎、兩組完全不同的旋鈕）。
// 讓面板去 import 那三支元件會變成循環相依，讓 pages/index.vue 去轉接則等於把
// 三支元件的內部細節搬到頁面層。所以改成反過來：元件自己登記，面板只讀這份清單。
//
// ⚠️ 跟 useSpeakerFieldBus / useParticleStage 同樣的寫法 —— 模組層級 ref =
// 全 app 單例。SSR 期間永遠是空陣列（只有 onMounted 之後才會有人登記），
// 所以不會有跨請求汙染，也不會有 hydration 落差。

const groups = ref([])

export function useParticleTool () {
  return {
    groups,

    /**
     * 登記一組可調整的旋鈕。⚠️ 一定要在 onBeforeUnmount 呼叫回傳的 unregister，
     * 否則元件被 v-if 換掉之後面板還會拿著一個指向死引擎的 apply。
     *
     * @param {object} group
     * @param {string}   group.id      唯一識別（'field' / 'mobileField' / 'portrait'）
     * @param {string}   group.label   分頁上顯示的名字
     * @param {string[]} group.fields  開放哪幾個旋鈕，key 見 particleToolFields.js
     * @param {object}   group.knobs   目前生效值（reactive，元件負責同步）
     * @param {object}   group.presets 檔位預設，{ tier: 檔位編號, values: {...} }[]
     * @param {Function} group.apply   async (values) => void
     * @param {object}   [group.meta]  純顯示用的補充資訊（reactive）
     * @returns {() => void} unregister
     */
    register (group) {
      groups.value = [...groups.value.filter(g => g.id !== group.id), group]

      return () => {
        groups.value = groups.value.filter(g => g.id !== group.id)
      }
    },
  }
}

// 這台瀏覽器「真的」能用 WebGPU 嗎（全 app 單例，只量一次）。
//
// ─── 為什麼不能只看 navigator.gpu ──────────────────────────────────────────
// Chrome / Edge 只要版本夠新就一定有 navigator.gpu，但顯示卡或驅動被瀏覽器列入黑名單時
// requestAdapter() 會回 null —— Windows 筆電（含 Snapdragon X 這類 ARM 機）常見。
// 這時粒子套件的 makeEngine 會「靜默」退到 canvas2d 的 CPU 引擎：沒有 morph、全部在主執行緒算，
// 首頁整個卡死（實測 25000 顆 3fps）。所以要實際要一次 adapter 才算數。
// isFallbackAdapter = 瀏覽器用軟體模擬的 GPU（SwiftShader 之類），一樣跑不動，當成不支援。
//
// ─── 用法 ──────────────────────────────────────────────────────────────────
//   const { webgpu } = useWebGpuSupport()
//   webgpu.value === null   還在量（呼叫端先什麼都別掛，免得掛了又換）
//   webgpu.value === true   有可用的 WebGPU
//   webgpu.value === false  沒有 → 首頁桌機改用影片背景（HomeVideoField）
//
// ⚠️ 只在 client 量。SSR 期間永遠是 null，呼叫端要包 <ClientOnly>（跟 useViewportMode 同一套）。
//
// ─── 預覽用參數 ────────────────────────────────────────────────────────────
//   ?webgpu=off   當作沒有 WebGPU —— 有 WebGPU 的電腦也能直接看影片版長怎樣（正式站也能開）

const WEBGPU_QUERY = 'webgpu'
const WEBGPU_OFF = 'off'

const webgpu = ref(null)
let probing = null

async function probe () {
  if (new URLSearchParams(window.location.search).get(WEBGPU_QUERY) === WEBGPU_OFF) return false
  try {
    if (!navigator.gpu) return false
    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) return false
    return !(adapter.isFallbackAdapter || adapter.info?.isFallbackAdapter)
  } catch {
    return false
  }
}

export function useWebGpuSupport () {
  if (!probing && typeof window !== 'undefined') {
    probing = probe().then((ok) => { webgpu.value = ok })
  }
  return { webgpu }
}

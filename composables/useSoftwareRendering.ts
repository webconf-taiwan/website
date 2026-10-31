let detected: boolean | undefined

/** 拿不到 WebGL，或拿到的是軟體模擬的繪圖器，代表瀏覽器目前用 CPU 畫圖 */
function detectSoftwareRendering() {
  const gl = document.createElement('canvas').getContext('webgl')
  if (!gl)
    return true

  const info = gl.getExtension('WEBGL_debug_renderer_info')
  const renderer = info
    ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
    : ''
  gl.getExtension('WEBGL_lose_context')?.loseContext()
  return /swiftshader|llvmpipe|software/i.test(renderer)
}

/**
 * 瀏覽器是否沒有 GPU 加速（例如關閉了圖形加速）。
 * 整個頁面只在瀏覽器端判斷一次；伺服器端與元件掛載前一律是 false，
 * 先照一般情況渲染，避免伺服器與瀏覽器的畫面不一致
 */
export function useSoftwareRendering() {
  const isSoftwareRendering = useState('softwareRendering', () => false)

  onMounted(() => {
    detected ??= detectSoftwareRendering()
    isSoftwareRendering.value = detected
  })

  return readonly(isSoftwareRendering)
}

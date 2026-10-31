// 與 components/share/NoiseMask.vue 的 <filter> 內容相同，修改時兩邊要一起改
const NOISE_FILTER = `
<filter id="noise-texture-filter" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
  <feFlood flood-opacity="0" result="BackgroundImageFix" />
  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
  <feTurbulence type="fractalNoise" baseFrequency="4.5164947509765625 4.5164947509765625" stitchTiles="stitch" numOctaves="3" result="noise" seed="9023" />
  <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
  <feComponentTransfer in="alphaNoise" result="coloredNoise1">
    <feFuncA type="discrete" tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 " />
  </feComponentTransfer>
  <feComposite operator="in" in2="shape" in="coloredNoise1" result="noise1Clipped" />
  <feFlood flood-color="rgba(0, 0, 0, 0.2)" result="color1Flood" />
  <feComposite operator="in" in2="noise1Clipped" in="color1Flood" result="color1" />
  <feMerge result="effect1_noise">
    <feMergeNode in="shape" />
    <feMergeNode in="color1" />
  </feMerge>
</filter>`

/**
 * NoiseMask 的 feTurbulence 每次重畫都要重算，首頁精選講者一進入畫面就要同時算 8 張，
 * 捲動到那裡會卡 50～60ms。閒置時用同一個濾鏡畫一次成點陣圖給所有遮罩共用。
 * 以螢幕實際像素密度繪製，顆粒大小與原本 SVG 一致；瀏覽器不支援 canvas 濾鏡時維持原本的 SVG
 */
export default defineNuxtPlugin((nuxtApp) => {
  const noiseTexture = useNoiseTexture()

  async function createTexture() {
    const holder = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    holder.setAttribute('width', '0')
    holder.setAttribute('height', '0')
    holder.setAttribute('aria-hidden', 'true')
    holder.style.position = 'absolute'
    holder.innerHTML = `<defs>${NOISE_FILTER}</defs>`
    document.body.append(holder)

    try {
      const size = NOISE_TEXTURE_SIZE
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(size * dpr)
      canvas.height = Math.round(size * dpr)
      const ctx = canvas.getContext('2d')
      if (!ctx || !('filter' in ctx))
        return

      ctx.scale(dpr, dpr)
      ctx.filter = 'url(#noise-texture-filter)'
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, size, size)

      // 濾鏡沒生效時整張會是純白，這時保留原本的 SVG
      const sample = ctx.getImageData(0, 0, 16, 16).data
      let hasNoise = false
      for (let i = 0; i < sample.length; i += 4) {
        if (sample[i] < 250) {
          hasNoise = true
          break
        }
      }
      if (!hasNoise)
        return

      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, 'image/png'),
      )
      if (blob)
        noiseTexture.value = URL.createObjectURL(blob)
    }
    catch {
      // 產生失敗就維持原本的 SVG 濾鏡
    }
    finally {
      holder.remove()
    }
  }

  nuxtApp.hook('app:mounted', () => {
    if ('requestIdleCallback' in window)
      window.requestIdleCallback(() => createTexture(), { timeout: 3000 })
    else
      setTimeout(createTexture, 1500)
  })
})

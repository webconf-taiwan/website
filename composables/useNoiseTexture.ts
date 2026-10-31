/** 雜訊材質的邊長（CSS px），要大於任何一個 NoiseMask，才不會在遮罩裡重複出現同一塊花紋 */
export const NOISE_TEXTURE_SIZE = 512

/**
 * NoiseMask 共用的雜訊點陣圖網址，由 plugins/noise-texture.client.ts 在閒置時產生；
 * 還沒產生前是 null，NoiseMask 會先用原本的 SVG 濾鏡
 */
export function useNoiseTexture() {
  return useState<string | null>('noiseTexture', () => null)
}

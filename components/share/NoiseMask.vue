<script setup lang="ts">
/*
 * 雜訊點陣圖準備好後改用點陣圖：同一個濾鏡畫出來的，看起來一樣，但不必每次重畫都重算 feTurbulence。
 * 準備好之前（含伺服器端渲染）仍用原本的 SVG 濾鏡。濾鏡內容與 plugins/noise-texture.client.ts 相同，修改時要一起改
 */
const noiseTexture = useNoiseTexture()

const textureStyle = computed(() =>
  noiseTexture.value
    ? {
        backgroundImage: `url("${noiseTexture.value}")`,
        backgroundSize: `${NOISE_TEXTURE_SIZE}px ${NOISE_TEXTURE_SIZE}px`,
      }
    : undefined,
)
</script>

<template>
  <div
    class="pointer-events-none absolute inset-0 opacity-35 mix-blend-multiply duration-300"
    :style="textureStyle"
  >
    <svg
      v-if="!noiseTexture"
      xmlns="http://www.w3.org/2000/svg"
      class="size-full"
    >
      <g
        xmlns="http://www.w3.org/2000/svg"
        filter="url(#filter0_n_40000750_27464)"
      >
        <rect
          width="100%"
          height="100%"
          fill="white"
        />
      </g>
      <defs xmlns="http://www.w3.org/2000/svg">
        <filter
          id="filter0_n_40000750_27464"
          x="0"
          y="0"
          width="100%"
          height="100%"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood
            flood-opacity="0"
            result="BackgroundImageFix"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="4.5164947509765625 4.5164947509765625"
            stitchTiles="stitch"
            numOctaves="3"
            result="noise"
            seed="9023"
          />
          <feColorMatrix
            in="noise"
            type="luminanceToAlpha"
            result="alphaNoise"
          />
          <feComponentTransfer
            in="alphaNoise"
            result="coloredNoise1"
          >
            <feFuncA
              type="discrete"
              tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 "
            />
          </feComponentTransfer>
          <feComposite
            operator="in"
            in2="shape"
            in="coloredNoise1"
            result="noise1Clipped"
          />
          <feFlood
            flood-color="rgba(0, 0, 0, 0.2)"
            result="color1Flood"
          />
          <feComposite
            operator="in"
            in2="noise1Clipped"
            in="color1Flood"
            result="color1"
          />
          <feMerge result="effect1_noise_40000750_27464">
            <feMergeNode in="shape" />
            <feMergeNode in="color1" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  </div>
</template>

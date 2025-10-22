<script setup lang="ts">
import { EXTERNAL_LINKS } from '~/constants/external-links'
</script>

<template>
  <section class="hero-section relative min-h-screen w-full">
    <div class="absolute inset-0 border-b-[1px] border-webconf-gray">
      <!-- 貝茲曲線特效 -->
      <HomeHeroCurve />

      <!-- 桌機使用 -->
      <svg
        class="absolute inset-0 hidden size-full lg:block"
        viewBox="0 0 1440 720"
        preserveAspectRatio="xMidYMid slice"
      >
        <!-- 左邊箭頭 -->
        <defs>
          <marker
            id="arrowLeft"
            markerWidth="10"
            markerHeight="10"
            refX="1"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M10,0 L10,10 L0,5 z"
              fill="#E6E6E6"
            />
          </marker>
        </defs>

        <!-- 右邊箭頭 -->
        <defs>
          <marker
            id="arrowRight"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L0,10 L10,5 z"
              fill="#E6E6E6"
            />
          </marker>
        </defs>

        <!-- 右側斜線 -->
        <g>
          <!-- 靜態軌道 -->
          <line
            x1="945"
            y1="0"
            x2="1440"
            y2="490"
            stroke="#E6E6E6"
            stroke-width="0.5"
          />

          <!-- 第一個斜線箭頭：速度較慢，持續顯示 -->
          <line
            x1="945"
            y1="0"
            x2="945"
            y2="0"
            stroke="transparent"
            stroke-width="1"
            marker-end="url(#arrowRight)"
          >
            <animate
              attributeName="x2"
              from="945"
              to="1440"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animate
              attributeName="y2"
              from="0"
              to="490"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </line>

          <!-- 第二個斜線箭頭：速度較快，延後開始以形成錯位 -->
          <line
            x1="945"
            y1="0"
            x2="945"
            y2="0"
            stroke="transparent"
            stroke-width="1"
            marker-end="url(#arrowRight)"
          >
            <animate
              attributeName="x2"
              from="945"
              to="1440"
              dur="6s"
              begin="3s"
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animate
              attributeName="y2"
              from="3"
              to="490"
              dur="6s"
              begin="3s"
              repeatCount="indefinite"
              calcMode="linear"
              restart="always"
            />
          </line>
        </g>

        <!-- 中間線條 -->
        <g>
          <!-- 靜態軌道 -->
          <line
            x1="210"
            y1="0"
            x2="930"
            y2="720"
            stroke="#E6E6E6"
            stroke-width="0.5"
          />

          <!-- 單一箭頭 -->
          <line
            x1="210"
            y1="0"
            x2="210"
            y2="0"
            stroke="transparent"
            stroke-width="1"
            marker-end="url(#arrowLeft)"
          >
            <animate
              attributeName="x2"
              to="210"
              from="930"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animate
              attributeName="y2"
              to="0"
              from="720"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </line>
        </g>

        <!-- 左側斜線 -->
        <g>
          <!-- 靜態軌道 -->
          <line
            x1="0"
            y1="125"
            x2="598"
            y2="720"
            stroke="#E6E6E6"
            stroke-width="0.5"
          />
          <!-- 第一個斜線箭頭：速度較慢，持續顯示 -->
          <line
            x1="0"
            y1="125"
            x2="0"
            y2="125"
            stroke="transparent"
            stroke-width="1"
            marker-end="url(#arrowRight)"
          >
            <animate
              attributeName="x2"
              from="0"
              to="598"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animate
              attributeName="y2"
              from="125"
              to="720"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </line>
          <!-- 第二個斜線箭頭：速度較快，延後開始以形成錯位 -->
          <line
            x1="0"
            y1="125"
            x2="0"
            y2="125"
            stroke="transparent"
            stroke-width="1"
            marker-end="url(#arrowRight)"
          >
            <!-- 延後 3s 開始；整段沒有 opacity 動畫 -->
            <animate
              attributeName="x2"
              from="0"
              to="598"
              dur="6s"
              begin="3s"
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animate
              attributeName="y2"
              from="125"
              to="720"
              dur="6s"
              begin="3s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </line>
        </g>

        <!-- 水平線 - 橫跨整個寬度 -->
        <g>
          <line
            x1="0"
            y1="479"
            x2="1440"
            y2="479"
            stroke="#E6E6E6"
            stroke-width="0.5"
          />
          <!-- 水平線箭頭 -->
          <line
            x1="0"
            y1="479"
            x2="0"
            y2="479"
            stroke="transparent"
            stroke-width="1"
            marker-end="url(#arrowRight)"
            color="#E6E6E6"
          >
            <animate
              attributeName="x2"
              from="0"
              to="1440"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animate
              attributeName="y2"
              from="479"
              to="479"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </line>
        </g>
      </svg>

      <!-- 平板使用 -->
      <svg
        class="absolute inset-0 hidden size-full xm:block lg:hidden"
        viewBox="0 0 768 720"
        preserveAspectRatio="xMidYMid slice"
      >
        <!-- 左邊箭頭 -->
        <defs>
          <marker
            id="arrowLeft-md"
            markerWidth="10"
            markerHeight="10"
            refX="1"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M10,0 L10,10 L0,5 z"
              fill="#E6E6E6"
            />
          </marker>
        </defs>

        <!-- 右邊箭頭 -->
        <defs>
          <marker
            id="arrowRight-md"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L0,10 L10,5 z"
              fill="#E6E6E6"
            />
          </marker>
        </defs>

        <!-- 右側線條 -->
        <g>
          <line
            x1="208"
            y1="0"
            x2="767"
            y2="555"
            stroke="#E6E6E6"
            stroke-width="0.5"
          />
          <!-- 第一個移動的箭頭 -->
          <line
            x1="208"
            y1="0"
            x2="208"
            y2="0"
            stroke="transparent"
            stroke-width="1"
            marker-end="url(#arrowRight-md)"
          >
            <animate
              attributeName="x2"
              values="208;767"
              dur="6s"
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animate
              attributeName="y2"
              values="0;555"
              dur="6s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </line>
          <!-- 第二個移動的箭頭 -->
          <line
            x1="208"
            y1="0"
            x2="208"
            y2="0"
            stroke="transparent"
            stroke-width="1"
            marker-end="url(#arrowRight-md)"
          >
            <animate
              attributeName="x2"
              values="208;767"
              dur="4s"
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animate
              attributeName="y2"
              values="0;555"
              dur="4s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </line>
        </g>

        <!-- 中間線條 -->
        <g>
          <!-- 靜態軌道 -->
          <line
            x1="-230"
            y1="0"
            x2="476"
            y2="720"
            stroke="#E6E6E6"
            stroke-width="0.5"
          />

          <!-- 單一箭頭 -->
          <line
            x1="-230"
            y1="0"
            x2="-230"
            y2="0"
            stroke="transparent"
            stroke-width="1"
            marker-end="url(#arrowLeft-md)"
          >
            <animate
              attributeName="x2"
              to="-230"
              from="476"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animate
              attributeName="y2"
              to="0"
              from="720"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </line>
        </g>

        <!-- 水平線 - 橫跨整個寬度 -->
        <g>
          <line
            x1="0"
            y1="479"
            x2="768"
            y2="479"
            stroke="#E6E6E6"
            stroke-width="0.5"
          />
          <!-- 水平線箭頭 -->
          <line
            x1="0"
            y1="479"
            x2="0"
            y2="479"
            stroke="transparent"
            stroke-width="1"
            marker-end="url(#arrowRight-md)"
            color="#E6E6E6"
          >
            <animate
              attributeName="x2"
              from="0"
              to="768"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animate
              attributeName="y2"
              from="479"
              to="479"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </line>
        </g>
      </svg>

      <!-- 手機使用 -->
      <svg
        class="absolute inset-0 block size-full xm:hidden"
        viewBox="0 0 360 640"
        preserveAspectRatio="xMidYMid slice"
      >
        <!-- 左邊箭頭 -->
        <defs>
          <marker
            id="arrowLeft-xs"
            markerWidth="10"
            markerHeight="10"
            refX="1"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M10,0 L10,10 L0,5 z"
              fill="#E6E6E6"
            />
          </marker>
        </defs>

        <!-- 右邊箭頭 -->
        <defs>
          <marker
            id="arrowRight-xs"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M0,0 L0,10 L10,5 z"
              fill="#E6E6E6"
            />
          </marker>
        </defs>

        <!-- 右側線條 -->
        <g>
          <line
            x1="169"
            y1="0"
            x2="483"
            y2="320"
            stroke="#E6E6E6"
            stroke-width="0.5"
          />
          <!-- 第一個移動的箭頭 -->
          <line
            x1="169"
            y1="0"
            x2="169"
            y2="0"
            stroke="transparent"
            stroke-width="1"
            marker-end="url(#arrowRight-xs)"
          >
            <animate
              attributeName="x2"
              values="169;483"
              dur="6s"
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animate
              attributeName="y2"
              values="0;320"
              dur="6s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </line>
          <!-- 第二個移動的箭頭 -->
          <line
            x1="169"
            y1="0"
            x2="169"
            y2="0"
            stroke="transparent"
            stroke-width="1"
            marker-end="url(#arrowRight-xs)"
          >
            <animate
              attributeName="x2"
              values="169;483"
              dur="4s"
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animate
              attributeName="y2"
              values="0;320"
              dur="4s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </line>
        </g>

        <!-- 中間線條 -->
        <g>
          <!-- 靜態軌道 -->
          <line
            x1="0"
            y1="415"
            x2="225"
            y2="640"
            stroke="#E6E6E6"
            stroke-width="0.5"
          />

          <!-- 單一箭頭 -->
          <line
            x1="225"
            y1="640"
            x2="225"
            y2="640"
            stroke="transparent"
            stroke-width="1"
            marker-end="url(#arrowRight-xs)"
          >
            <animate
              attributeName="x2"
              from="225"
              to="0"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animate
              attributeName="y2"
              from="640"
              to="415"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </line>
        </g>

        <!-- 水平線 - 橫跨整個寬度 -->
        <g>
          <line
            x1="0"
            y1="465"
            x2="360"
            y2="465"
            stroke="#E6E6E6"
            stroke-width="0.5"
          />
          <!-- 水平線箭頭 -->
          <line
            x1="0"
            y1="465"
            x2="0"
            y2="465"
            stroke="transparent"
            stroke-width="1"
            marker-end="url(#arrowRight-xs)"
            color="#E6E6E6"
          >
            <animate
              attributeName="x2"
              from="0"
              to="360"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animate
              attributeName="y2"
              from="465"
              to="465"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </line>
        </g>

        <!-- 水平線 - 橫跨整個寬度 -->
        <g>
          <line
            x1="0"
            y1="170"
            x2="360"
            y2="170"
            stroke="#E6E6E6"
            stroke-width="0.5"
          />
          <!-- 水平線箭頭 -->
          <line
            x1="0"
            y1="170"
            x2="0"
            y2="170"
            stroke="transparent"
            stroke-width="1"
            marker-end="url(#arrowRight-xs)"
            color="#E6E6E6"
          >
            <animate
              attributeName="x2"
              from="0"
              to="360"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
            <animate
              attributeName="y2"
              from="170"
              to="170"
              dur="8s"
              repeatCount="indefinite"
              calcMode="linear"
            />
          </line>
        </g>
      </svg>

      <!-- 標題區域 -->
      <div
        class="absolute right-0 top-[49%] w-full -translate-y-1/2 text-right md:top-[63%] lg:right-[4%] lg:w-auto"
      >
        <div
          class="flex flex-col items-center gap-4 px-5 xm:items-end md:gap-[52px] md:px-[52px]"
        >
          <h1>
            <span class="sr-only">2025 WebConf</span>
            <NuxtImg
              src="/images/heroLogo.webp"
              alt="2025 WebConf Logo"
              width="570"
              height="215"
              class="mr-0 md:mr-[86px] md:w-[570px]"
            />
          </h1>
          <p class="pb-8 text-h4-24 text-white md:pb-0">
            DEC. 12 - 13｜瓶蓋工廠台北製造所
          </p>
          <ShareLinkButton
            :to="EXTERNAL_LINKS.CONF_TICKET_URL"
            target="_blank"
            rel="noopener noreferrer"
            class="text-center"
          >
            前往購票
          </ShareLinkButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  background-image: url("/images/heroMobileBg.webp");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

@media (min-width: 480px) {
  .hero-section {
    background-image: url("/images/heroTabletBg.webp");
  }
}

@media (min-width: 1024px) {
  .hero-section {
    background-image: url("/images/heroBg.webp");
  }
}

@supports (min-height: 100svh) {
  .hero-section {
    min-height: 100svh;
  }
}
</style>

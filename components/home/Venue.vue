<template>
  <section class="relative pt-0 sm:pt-20">
    <!-- 桌機使用 -->
    <svg
      class="absolute inset-0 hidden size-full lg:block"
      viewBox="0 0 1440 880"
      preserveAspectRatio="xMidYMid slice"
    >
      <!-- 左邊箭頭 -->
      <defs>
        <marker
          id="arrowLeft-venue"
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
          id="arrowRight-venue"
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
          x1="1040"
          y1="0"
          x2="1440"
          y2="405"
          stroke="#E6E6E6"
          stroke-width="0.67"
        />

        <!-- 第一個斜線箭頭：速度較慢，持續顯示 -->
        <line
          x1="1040"
          y1="0"
          x2="1040"
          y2="0"
          stroke="transparent"
          stroke-width="1"
          marker-end="url(#arrowRight-venue)"
        >
          <animate
            attributeName="x2"
            from="1040"
            to="1440"
            dur="8s"
            repeatCount="indefinite"
            calcMode="linear"
          />
          <animate
            attributeName="y2"
            from="0"
            to="405"
            dur="8s"
            repeatCount="indefinite"
            calcMode="linear"
          />
        </line>

        <!-- 第二個斜線箭頭：速度較快，延後開始以形成錯位 -->
        <line
          x1="1040"
          y1="0"
          x2="1040"
          y2="0"
          stroke="transparent"
          stroke-width="1"
          marker-end="url(#arrowRight-venue)"
        >
          <animate
            attributeName="x2"
            from="1040"
            to="1440"
            dur="6s"
            begin="3s"
            repeatCount="indefinite"
            calcMode="linear"
          />
          <animate
            attributeName="y2"
            from="0"
            to="405"
            dur="6s"
            begin="3s"
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
          y1="105"
          x2="820"
          y2="880"
          stroke="#E6E6E6"
          stroke-width="0.67"
        />

        <!-- 第一個箭頭 -->
        <line
          x1="0"
          y1="105"
          x2="0"
          y2="105"
          stroke="transparent"
          stroke-width="1"
          marker-end="url(#arrowLeft-venue)"
        >
          <animate
            attributeName="x2"
            from="820"
            to="0"
            dur="8s"
            repeatCount="indefinite"
            calcMode="linear"
          />
          <animate
            attributeName="y2"
            from="880"
            to="105"
            dur="8s"
            repeatCount="indefinite"
            calcMode="linear"
          />
        </line>

        <!-- 第二個箭頭：速度較快，延後開始 -->
        <line
          x1="0"
          y1="105"
          x2="0"
          y2="105"
          stroke="transparent"
          stroke-width="1"
          marker-end="url(#arrowLeft-venue)"
        >
          <animate
            attributeName="x2"
            from="820"
            to="0"
            dur="6s"
            begin="3s"
            repeatCount="indefinite"
            calcMode="linear"
          />
          <animate
            attributeName="y2"
            from="880"
            to="105"
            dur="6s"
            begin="3s"
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
          y1="425"
          x2="455"
          y2="880"
          stroke="#E6E6E6"
          stroke-width="0.67"
        />

        <!-- 第一個斜線箭頭：速度較慢，持續顯示 -->
        <line
          x1="0"
          y1="425"
          x2="0"
          y2="425"
          stroke="transparent"
          stroke-width="1"
          marker-end="url(#arrowRight-venue)"
        >
          <animate
            attributeName="x2"
            from="0"
            to="455"
            dur="8s"
            repeatCount="indefinite"
            calcMode="linear"
          />
          <animate
            attributeName="y2"
            from="425"
            to="880"
            dur="8s"
            repeatCount="indefinite"
            calcMode="linear"
          />
        </line>

        <!-- 第二個斜線箭頭：速度較快，延後開始以形成錯位 -->
        <line
          x1="0"
          y1="425"
          x2="0"
          y2="425"
          stroke="transparent"
          stroke-width="1"
          marker-end="url(#arrowRight-venue)"
        >
          <animate
            attributeName="x2"
            from="0"
            to="455"
            dur="6s"
            begin="3s"
            repeatCount="indefinite"
            calcMode="linear"
          />
          <animate
            attributeName="y2"
            from="425"
            to="880"
            dur="6s"
            begin="3s"
            repeatCount="indefinite"
            calcMode="linear"
          />
        </line>
      </g>
    </svg>

    <!-- 平板使用 -->
    <svg
      class="absolute inset-0 hidden size-full md:block lg:hidden"
      viewBox="0 0 768 1014"
      preserveAspectRatio="xMidYMid slice"
    >
      <!-- 左邊箭頭 -->
      <defs>
        <marker
          id="arrowLeft-venue-md"
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
          id="arrowRight-venue-md"
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

      <!-- 中間線條 -->
      <g>
        <!-- 靜態軌道 -->
        <line
          x1="0"
          y1="205"
          x2="685"
          y2="1014"
          stroke="#E6E6E6"
          stroke-width="0.67"
        />

        <!-- 第一個箭頭 -->
        <line
          x1="0"
          y1="205"
          x2="0"
          y2="205"
          stroke="transparent"
          stroke-width="1"
          marker-end="url(#arrowLeft-venue-md)"
        >
          <animate
            attributeName="x2"
            from="685"
            to="0"
            dur="8s"
            repeatCount="indefinite"
            calcMode="linear"
          />
          <animate
            attributeName="y2"
            from="1014"
            to="205"
            dur="8s"
            repeatCount="indefinite"
            calcMode="linear"
          />
        </line>

        <!-- 第二個箭頭：速度較快，延後開始 -->
        <line
          x1="0"
          y1="205"
          x2="0"
          y2="205"
          stroke="transparent"
          stroke-width="1"
          marker-end="url(#arrowLeft-venue-md)"
        >
          <animate
            attributeName="x2"
            from="685"
            to="0"
            dur="6s"
            begin="3s"
            repeatCount="indefinite"
            calcMode="linear"
          />
          <animate
            attributeName="y2"
            from="1014"
            to="205"
            dur="6s"
            begin="3s"
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
          y1="630"
          x2="325"
          y2="1014"
          stroke="#E6E6E6"
          stroke-width="0.67"
        />

        <!-- 第一個斜線箭頭：速度較慢，持續顯示 -->
        <line
          x1="0"
          y1="630"
          x2="0"
          y2="630"
          stroke="transparent"
          stroke-width="1"
          marker-end="url(#arrowRight-venue-md)"
        >
          <animate
            attributeName="x2"
            from="0"
            to="325"
            dur="8s"
            repeatCount="indefinite"
            calcMode="linear"
          />
          <animate
            attributeName="y2"
            from="630"
            to="1014"
            dur="8s"
            repeatCount="indefinite"
            calcMode="linear"
          />
        </line>

        <!-- 第二個斜線箭頭：速度較快，延後開始以形成錯位 -->
        <line
          x1="0"
          y1="630"
          x2="0"
          y2="630"
          stroke="transparent"
          stroke-width="1"
          marker-end="url(#arrowRight-venue-md)"
        >
          <animate
            attributeName="x2"
            from="0"
            to="325"
            dur="6s"
            begin="3s"
            repeatCount="indefinite"
            calcMode="linear"
          />
          <animate
            attributeName="y2"
            from="630"
            to="1014"
            dur="6s"
            begin="3s"
            repeatCount="indefinite"
            calcMode="linear"
          />
        </line>
      </g>
    </svg>

    <div
      class="container flex flex-col p-0 sm:px-16 sm:py-20 lg:flex-row lg:px-20 lg:pb-60"
    >
      <div
        v-cursor="{ scale: 0.4, duration: 0.5 }"
        class="group relative w-full border-x-0 border-y-[0.5px] border-webconf-frame bg-black px-5 pb-5 pt-[85px] text-webconf-gray sm:aspect-auto sm:border-x-[0.5px] sm:pb-0 sm:pl-[29.14px] sm:pr-[34.24px] sm:pt-[29px] lg:w-[68.75%] lg:pb-[24px] lg:pl-[40px] lg:pr-[47px] lg:pt-0"
      >
        <!-- 標題 -->
        <div
          class="absolute left-1/2 top-5 z-10 w-fit -translate-x-1/2 sm:left-10 sm:top-8 sm:translate-x-0"
        >
          <h2 class="flex px-10 pb-3 text-h3-40 text-white sm:pb-4">
            Venue
          </h2>
          <div class="flex items-center">
            <span class="size-3 bg-white"></span>
            <span class="h-[1px] flex-1 bg-white"></span>
            <span class="size-3 bg-white"></span>
          </div>
        </div>

        <!-- 場地圖 -->
        <div class="pic h-full translate-y-0 sm:translate-y-[10px]">
          <NuxtImg
            src="/images/map.webp"
            alt="WebConf 2025 場地地圖"
            width="793"
            height="536"
            fit="contain"
            class="size-full translate-y-0 object-contain"
          />
        </div>
        <!-- 場地標題 -->
        <p
          class="absolute bottom-10 left-12 hidden text-h4-24 text-white lg:block"
        >
          瓶蓋工廠台北製造所
        </p>
        <!-- 指北針圖示 -->
        <NuxtImg
          src="/images/venueCompass.webp"
          alt="指北針圖示"
          width="161"
          height="117"
          class="absolute right-0 top-12 hidden sm:block"
        />
        <div
          class="absolute left-0 top-0 block size-full bg-webconf-blue opacity-0 mix-blend-color transition-opacity duration-300 lg:group-hover:opacity-100"
        ></div>
        <div
          class="absolute left-0 top-0 block size-full bg-webconf-blue opacity-0 mix-blend-color transition-opacity duration-300 lg:group-hover:opacity-60"
        ></div>
      </div>
      <ShareGradientDotsCard
        class="relative ml-0 h-fit w-full translate-y-0 sm:px-[60px] sm:pb-[84px] lg:ml-[-12.65%] lg:w-[43.9%] lg:translate-y-[60%] lg:pb-[52px]"
      >
        <div class="items-start">
          <!-- 搭乘工具一 -->
          <div class="flex items-start gap-6 pb-8 text-white sm:gap-8">
            <ShareTag class="my-2">
              搭乘捷運
            </ShareTag>
            <p class="flex-1 text-body-18">
              捷運南港站 1A
              出口，步行至連通道至台鐵/高鐵北門出站，經市民大道向西步行約 5 分鐘
            </p>
          </div>
          <!-- 搭乘工具二 -->
          <div
            class="flex items-start gap-6 pb-10 text-white sm:gap-8 sm:pb-[60px]"
          >
            <ShareTag class="my-2">
              搭乘火車
            </ShareTag>
            <p class="flex-1 text-body-18">
              搭乘至南港火車站的北門出站，經市民大道向西步行約 5 分鐘
            </p>
          </div>
          <ShareLinkButton
            to="/coming-soon"
            class="m-auto flex w-fit"
          >
            更多資訊
          </ShareLinkButton>
        </div>
      </ShareGradientDotsCard>
    </div>
  </section>
</template>

<script setup lang="ts">
const emit = defineEmits(['close'])
const route = useRoute()
const router = useRouter()
const gsap = useGsap()
const popoverRef = ref(null)

function handleClose() {
  // 淡出動畫
  gsap.to(popoverRef.value, {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.out',
    onComplete: () => {
      resetRoute()
      emit('close')
    },
  })
}

function resetRoute() {
  const { speakerId, ...rest } = route.query
  router.push({ query: rest })
}

onMounted(() => {
  const lenis = useLenis()
  if (lenis) {
    lenis.stop()
  }

  // 淡入動畫
  gsap.fromTo(
    popoverRef.value,
    {
      opacity: 0,
    },
    {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
    },
  )
})

onUnmounted(() => {
  const lenis = useLenis()
  if (lenis) {
    lenis.start()
  }
})
</script>

<template>
  <div
    ref="popoverRef"
    class="fixed inset-0 z-20 flex h-svh bg-black/80 pt-[55px]"
  >
    <AgentdaFloatingBlocks />

    <div class="pic">
      <div class="relative border-b border-webconf-gray">
        <NuxtImg
          src="/images/speakers/carousel-03_will.webp"
          width="350"
          height="498"
          alt="講者照片"
        />
        <div class="absolute -bottom-2 left-10 flex gap-4">
          <div class="size-4 bg-webconf-gray"></div>
          <div class="size-4 bg-webconf-gray"></div>
          <div class="size-4 bg-webconf-gray"></div>
        </div>
      </div>
    </div>
    <div class="txt flex-1 border border-y-0 border-webconf-gray bg-black">
      <div
        class="speaker-detail-header relative h-[76px] border-b border-webconf-gray"
      >
        <div
          class="absolute right-[28px] top-[18px] grid size-10 place-content-center bg-webconf-gray"
          @click="handleClose"
        >
          <NuxtImg
            src="/images/icon/black-close.svg"
            width="24"
            height="24"
            alt="close"
          />
        </div>
      </div>
      <div class="flex h-[calc(100%-76px)]">
        <!-- 講者介紹區塊 -->
        <div
          data-lenis-prevent
          class="info w-1/2 overflow-auto border-r border-webconf-gray px-12 py-8 text-white"
        >
          <div class="mb-10">
            <span
              class="mb-8 inline-block bg-webconf-gray px-4 py-[6px] text-xs font-semibold leading-[1.4] tracking-[0.02em] text-webconf-blue"
            >講者介紹</span>
            <h2 class="mb-4 text-h3-40">
              Will 保哥
            </h2>
            <span class="inline-block text-webconf-gray">多奇數位創意 / 技術總監</span>
          </div>
          <p class="mb-10 text-body-16 text-webconf-gray">
            現任「多奇數位創意有限公司」技術總監。2024 年榮獲 GenAI 方向的
            Google Developer Expert (GDE) 開發專家。2019
            獲選微軟技術社群區域總監 (Microsoft Regional Director)。2018 年榮獲
            Angular 方向的 Google Developer Expert (GDE) 開發專家。連續 18
            度當選微軟最有價值專家(MVP)。熟悉 Generative
            AI、Angular、JavaScript、.NET、C#、Java、Go、Docker、Kubernetes
            相關技術。擅長 DevOps
            與組織文化建立、軟體團隊建構與管理。熱愛分享知識。
          </p>
          <ul class="flex gap-3">
            <li class="border border-webconf-blue/90 p-[10px]">
              <a href="#">
                <NuxtImg
                  src="/images/icon/fb.svg"
                  width="24"
                  height="24"
                  alt="fb"
                />
              </a>
            </li>
            <li class="border border-webconf-blue/90 p-[10px]">
              <a href="#">
                <NuxtImg
                  src="/images/icon/twitter.svg"
                  width="24"
                  height="24"
                  alt="twitter"
                />
              </a>
            </li>
            <li class="border border-webconf-blue/90 p-[10px]">
              <a href="#">
                <NuxtImg
                  src="/images/icon/web.svg"
                  width="24"
                  height="24"
                  alt="web"
                />
              </a>
            </li>
            <li class="border border-webconf-blue/90 p-[10px]">
              <a href="#">
                <NuxtImg
                  src="/images/icon/ig.svg"
                  width="24"
                  height="24"
                  alt="ig"
                />
              </a>
            </li>
          </ul>
        </div>
        <!-- 議程介紹區塊 -->
        <div
          data-lenis-prevent
          class="agentda w-1/2 overflow-auto border-r border-webconf-gray px-12 text-white"
        >
          <!-- 議程簡介 -->
          <div class="-mx-12 border-b-[0.5px] border-webconf-frame">
            <div class="px-12 py-8">
              <div class="mb-10">
                <span
                  class="mb-8 inline-block bg-webconf-gray px-4 py-[6px] text-xs font-semibold leading-[1.4] tracking-[0.02em] text-webconf-blue"
                >議程介紹</span>
                <h2 class="mb-5 text-h3-40">
                  深入淺出 Playwright Agent 代理人模式
                </h2>
                <div
                  class="mb-5 flex text-xl font-semibold leading-[1] tracking-[0.02em] text-webconf-gray"
                >
                  <time
                    datetime="2025-08-12T09:00/10:50"
                    class="flex gap-3 after:border-r-[0.5px] after:border-webconf-gray after:content-['']"
                  >8/12 (sat.) 09:00~09:50</time><span class="inline-block pl-3">M 棟</span>
                </div>
              </div>
              <div class="mb-10 flex gap-3 text-btn-14 text-webconf-gray">
                <a
                  href="#"
                  class="inline-block bg-webconf-blue px-6 py-2"
                >
                  共筆文件
                </a>
                <a
                  href="#"
                  class="inline-block bg-webconf-blue px-[31px] py-2"
                >
                  投影片
                </a>
              </div>
              <p class="mb-10 text-body-16 text-webconf-gray">
                "在 AI 驅動的時代，測試自動化也需要與時俱進。本議程將深入探討
                Playwright Agents 代理人模式，展示如何結合 AI
                與端到端測試框架，打造更智能、更靈活的測試解決方案。
                我們將從基礎概念開始，逐步介紹： - Playwright Agents
                的核心架構與設計理念 - 如何使用自主決策的測試代理人 - 結合 LLM
                實現智能化測試場景 - 實際案例分析與最佳實踐 - 常見挑戰與解決方案
                無論您是測試工程師、開發者，或是對 AI
                與自動化測試整合感興趣的技術人員，都能從本議程中獲得實用的知識與啟發，為您的測試策略注入新的可能性。"
              </p>
              <div
                class="flex gap-2 text-xs font-semibold leading-[1.4] tracking-[0.02%] text-webconf-gray"
              >
                <div class="border border-webconf-blue px-4 py-[6px]">
                  Frontend
                </div>
                <div class="border border-webconf-blue px-4 py-[6px]">
                  AI
                </div>
              </div>
            </div>
          </div>
          <!-- 目標受眾 -->
          <div class="-mx-12 border-b-[0.5px] border-webconf-frame">
            <div class="px-12 py-8">
              <h3 class="mb-4 text-h4-24">
                目標受眾
              </h3>
              <p class="text-body-16 text-webconf-gray">
                ALL
              </p>
            </div>
          </div>
          <!-- 預期收穫 -->
          <div class="-mx-12">
            <div class="px-12 py-8">
              <h3 class="mb-4 text-h4-24">
                預期收穫
              </h3>
              <p class="text-body-16 text-webconf-gray">
                - 理解 Playwright Agents 代理人模式的核心概念與運作原理 -
                學會如何將 AI 技術整合到端到端測試流程中 - 掌握使用 LLM
                建立智能測試代理人的實作技巧 - 了解 AI
                驅動測試的實際應用場景與限制 -
                獲得可立即應用於專案的最佳實踐與範例程式碼 -
                認識測試自動化的未來趨勢與發展方向
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.speaker-detail-header {
  background-image: url("/images/speakerPopoverBg.webp");
  background-repeat: no-repeat;
  background-position: center bottom;
  background-size: auto 76px;
}

@media (min-width: 1440px) {
  .speaker-detail-header {
    background-size: 100% 76px;
  }
}
</style>

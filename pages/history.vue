<script setup lang="ts">
import { CONF_LINKS } from '~/constants/confLinks'
import { EXTERNAL_LINKS } from '~/constants/externalLinks'

useSeoMeta({
  title: '歷屆回顧',
})

const { gsap } = useGsap()

const hoveredImageIndex = ref(-1)

// 使用 useMouseInElement 更新 hoveredImageIndex 以確保 hover 效果正確觸發
function useItemHover(index: number) {
  const itemRef = ref<HTMLLIElement | null>(null)
  const { isOutside } = useMouseInElement(itemRef)

  watch(isOutside, (outside) => {
    if (!outside)
      hoveredImageIndex.value = index
    else if (hoveredImageIndex.value === index)
      hoveredImageIndex.value = -1
  })

  return itemRef
}

const itemRefs = CONF_LINKS.map((_, i) => useItemHover(i))

// 手動觸發 v-cursor 效果
function useCursorLink() {
  const linkRef = ref<HTMLAnchorElement | null>(null)
  const { isOutside } = useMouseInElement(linkRef)

  watch(isOutside, (outside) => {
    if (!linkRef.value)
      return

    if (!outside) {
      linkRef.value.dispatchEvent(
        new MouseEvent('mouseenter', { bubbles: true, cancelable: true }),
      )
    }
    else {
      linkRef.value.dispatchEvent(
        new MouseEvent('mouseleave', { bubbles: true, cancelable: true }),
      )
    }
  })

  return linkRef
}

const cursorLinkRefs = CONF_LINKS.map(() => useCursorLink())

const historyBgRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (!historyBgRef.value)
    return
  gsap.fromTo(
    historyBgRef.value,
    { backgroundPosition: 'center 50%' },
    {
      backgroundPosition: 'center 90%',
      ease: 'none',
      scrollTrigger: {
        trigger: historyBgRef.value,
        start: 'top center',
        end: 'bottom top',
        scrub: 0.5,
      },
    },
  )
})
</script>

<template>
  <div>
    <section class="flex-1">
      <ShareBanner
        title="HiSTORY"
        sub-title="歷史回顧"
      />
    </section>

    <main class="lg:mb-40 lg:mt-[100px]">
      <ul class="flex w-full flex-col lg:gap-[100px] lg:px-[calc(100%/9)]">
        <li
          v-for="(item, index) in CONF_LINKS"
          :key="item.year"
          :ref="
            (el) => {
              itemRefs[index].value = el as HTMLLIElement | null;
            }
          "
          :class="{
            'lg:self-end': index % 2 === 1,
          }"
          class="hover:blue-shadow group relative border-b border-webconf-gray/50 bg-black text-white duration-300 lg:w-[calc(100dvw/2)]"
        >
          <div class="size-full">
            <NuxtImg
              :src="item.img"
              :alt="`${item.year} WebConf 網站封面`"
              class="size-full object-cover"
            />
            <div
              class="gap-5 px-5 pb-12 pt-5 duration-300 lg:flex group-hover:lg:bg-webconf-blue 2xl:gap-[68px] 2xl:px-6 2xl:pb-10 2xl:pt-6"
            >
              <h2 class="text-h4-60">
                {{ item.year }}
              </h2>

              <p class="mt-3 text-body-18 lg:mt-0">
                {{ item.desc }}
              </p>

              <NuxtLink
                :to="item.link"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-6 inline-block bg-webconf-blue px-6 py-2 lg:hidden"
              >
                前往頁面
              </NuxtLink>

              <a
                :ref="
                  (el) => {
                    cursorLinkRefs[index].value = el as HTMLAnchorElement;
                  }
                "
                v-cursor="{
                  scale: 5,
                  duration: 0.5,
                  backgroundColor: 'rgba(0, 46, 255, 0.9)',
                  text: 'VIEW',
                }"
                :href="item.link"
                target="_blank"
                rel="noopener noreferrer"
                class="absolute left-0 top-0 hidden size-full bg-webconf-blue lg:block lg:bg-transparent"
              >
              </a>
            </div>
          </div>
        </li>
      </ul>
    </main>

    <NuxtImg
      v-for="(item, index) in CONF_LINKS"
      :key="item.year"
      :src="item.img"
      :alt="`${item.year} WebConf 網站封面`"
      :class="{
        'opacity-60': hoveredImageIndex === index,
      }"
      class="pointer-events-none fixed left-0 top-0 z-[-1] hidden h-[100dvh] w-screen object-cover opacity-0 blur-[8px] duration-500 ease-in-out group-hover:opacity-60 lg:block"
    />

    <section
      ref="historyBgRef"
      class="z-10 flex h-[500px] flex-col items-center justify-center border-y border-webconf-gray bg-[url('/images/home/CTA/CTABg.webp')] bg-center bg-no-repeat md:bg-cover"
    >
      <h3 class="text-h4-60 text-webconf-gray">
        歷屆活動花絮
      </h3>

      <ShareLinkButton
        :to="EXTERNAL_LINKS.WEBCONF_GALLERY_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-10"
      >
        前往回顧
      </ShareLinkButton>
    </section>
  </div>
</template>

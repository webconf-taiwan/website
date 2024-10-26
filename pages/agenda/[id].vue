<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const route = useRoute()
const id = route.params.id

useSeoMeta({
  title: '議程｜以 Kotlin Multiplatform 制霸全平台｜郭藺瑩 Lydia',
  description: '多年技術社群志工，積極參與 Kotlin User Group 運作，並建立 Kotlin 讀書會/練功場等活動。目前在 JetBrains 擔任技術傳教士，負責推廣 IDE 工具及技術。平時醉心於技術研究，期待能將複雜的技術名詞用通俗易懂的方式讓人人都能吸收。工作之餘是一位甜點愛好者。',
  ogTitle: '議程｜以 Kotlin Multiplatform 制霸全平台｜郭藺瑩 Lydia',
  ogDescription: '多年技術社群志工，積極參與 Kotlin User Group 運作，並建立 Kotlin 讀書會/練功場等活動。目前在 JetBrains 擔任技術傳教士，負責推廣 IDE 工具及技術。平時醉心於技術研究，期待能將複雜的技術名詞用通俗易懂的方式讓人人都能吸收。工作之餘是一位甜點愛好者。',
  ogImage: '/home/agenda/agenda-id-top-decorate.svg',
  twitterTitle: '議程｜以 Kotlin Multiplatform 制霸全平台｜郭藺瑩 Lydia',
  twitterDescription: '多年技術社群志工，積極參與 Kotlin User Group 運作，並建立 Kotlin 讀書會/練功場等活動。目前在 JetBrains 擔任技術傳教士，負責推廣 IDE 工具及技術。平時醉心於技術研究，期待能將複雜的技術名詞用通俗易懂的方式讓人人都能吸收。工作之餘是一位甜點愛好者。',
  twitterImage: '/home/agenda/agenda-id-top-decorate.svg',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div class=" flex min-h-[calc(100dvh-100px)] px-5">
    <div class="mx-auto mb-[100px] mt-8 flex w-full max-w-[872px] flex-col bg-black px-4 py-8 lg:mb-[84px] lg:mt-16 lg:px-10 lg:py-8">
      <!-- 裝飾用 Header -->
      <div class="h-auto w-full">
        <NuxtImg
          src="/home/agenda/agenda-id-top-decorate.svg"
          alt="drawer-top-decorate-lg"
          class="block w-full sm:hidden"
        />
        <NuxtImg
          src="/home/agenda/agenda-id-top-decorate-lg.svg"
          alt="drawer-top-decorate-lg"
          class="hidden w-full sm:block"
        />
      </div>

      <Breadcrumb class="my-6 lg:mb-8 lg:mt-10">
        <BreadcrumbList class="gap-2">
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              class="text-base text-white"
            >
              首頁
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator class="size-5 text-white" />

          <BreadcrumbItem>
            <BreadcrumbLink
              href="/agenda"
              class="text-base text-white"
            >
              議程
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator class="size-5 text-white" />

          <BreadcrumbItem>
            <BreadcrumbPage class="text-base font-bold text-white">
              郭藺瑩 Lydia - {{ id }}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div class="grow">
        <AgendaDrawerWrapper />
      </div>

      <!-- 裝飾用 Footer -->
      <div class="mt-auto flex h-auto w-full justify-center border-b border-primary-green pb-2">
        <NuxtImg
          src="/footer/bar.svg"
          alt="drawer-top-decorate-lg"
          width="56"
          height="10"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  desc: {
    type: String,
    default: ''
  },
  image: {
    type: [String, Boolean],
    default: ''
  },
  url: {
    type: String,
    default: ''
  }
})

const title = computed(() => props.title || config.public.APP_TITLE)
const description = computed(() => props.desc || config.public.APP_DESC)
const siteUrl = computed(() => config.public.APP_URL)
const pageUrl = computed(() => props.url ? `${siteUrl.value}/${props.url}` : siteUrl.value)

const seoMeta = {
  title,
  description,
  ogTitle: title,
  ogSiteName: title,
  ogUrl: pageUrl,
  ogDescription: description,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description
}

// image 沒特別指定時完全不帶 ogImage/twitterImage 這兩個 key（連 undefined 都不帶），
// 讓 nuxt-og-image 偵測到頁面沒設圖才會自動依 title 產生 OG 圖。
// 過去這裡硬寫一張不存在的 og_img.jpeg，分享卡片長年是破圖。
if (props.image) {
  seoMeta.ogImage = props.image
  seoMeta.twitterImage = props.image
}

useServerSeoMeta(seoMeta)
useSeoMeta(seoMeta)
</script>

<template>
  <Head>
    <Title>{{ title }}</Title>
    <Meta name="description" :content="description" />
  </Head>
</template>

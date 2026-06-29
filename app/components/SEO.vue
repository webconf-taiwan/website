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
const imageUrl = computed(() => props.image || `${siteUrl.value}/og_img.jpeg`)

useServerSeoMeta({
  title,
  description,
  ogTitle: title,
  ogSiteName: title,
  ogUrl: pageUrl,
  ogDescription: description,
  ogImage: imageUrl,
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: imageUrl
})

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogSiteName: title,
  ogUrl: pageUrl,
  ogDescription: description,
  ogImage: imageUrl,
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: imageUrl
})
</script>

<template>
  <Head>
    <Title>{{ title }}</Title>
    <Meta name="description" :content="description" />
  </Head>
</template>

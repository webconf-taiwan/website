<script setup>
const props = defineProps({
  error: {
    type: Object,
    default: null
  }
})

// Nuxt 錯誤頁取代 app.vue，沒有 LayoutPageIntro；掛載後直接放行共用進場。
const { introDone } = useSiteIntro()
onMounted(() => { introDone.value = true })

const statusCode = computed(() => props.error?.statusCode || 404)
const title = computed(() => String(statusCode.value || 404))
const subtitle = computed(() => {
  if (statusCode.value === 404) return '找不到此頁面'

  return '發生了一些問題'
})

function handleTicket () {
  window.open('https://5xcamp.us/webconf2026-ticket', '_blank', 'noopener,noreferrer')
}

function handleHome () {
  clearError({ redirect: '/' })
}
</script>

<template>
  <!-- ⚠️ 一定要用 Lazy：Nuxt 4 的 nuxt-root 是「靜態」import 錯誤頁，
       直接寫 CommonTemporaryPage 會把整串粒子場（PlateField → PlateMobileField、
       DesktopHeroField、useParticleMorph…約 60KB）打進 entry，每一頁都得先下載。 -->
  <LazyCommonTemporaryPage
    variant="404"
    :title="title"
    :subtitle="subtitle"
    @mobile-action="handleTicket"
    @desktop-action="handleHome"
  />
</template>

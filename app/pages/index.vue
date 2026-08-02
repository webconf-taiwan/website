<script setup>
const allStore = useAllStore()
const { count, doubleCount, windowWidth, pageLoading } = storeToRefs(allStore)

onMounted(() => {
  windowWidth.value = window.innerWidth

  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth
  })
})

function simulateLoading () {
  pageLoading.value = true

  setTimeout(() => {
    pageLoading.value = false
  }, 1500)
}
</script>

<template>
  <div class="container py-16 md:py-24">
    <section class="mx-auto max-w-2xl text-center">
      <p class="text-body-lg mb-4 text-brand">
        Pinia Demo
      </p>
      <h1 class="text-h2 text-txt-dark">
        allStore 示範
      </h1>
      <p class="text-body mt-4 text-txt-light">
        計數器、視窗寬度、全頁 Loading 都走 Pinia 全域狀態。
      </p>
    </section>

    <section class="mx-auto mt-12 max-w-xl rounded-2xl border border-gray-200 p-8">
      <h2 class="text-h5 text-txt-dark">
        計數器
      </h2>

      <p class="text-h1 mt-6 text-brand">
        {{ count }}
      </p>
      <p class="text-body-lg mt-2 text-txt-light">
        doubleCount：{{ doubleCount }}
      </p>

      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <AtomButton intent="secondary" @click="allStore.decrement">
          <AtomIcon name="minus" />
          減一
        </AtomButton>
        <AtomButton intent="primary" @click="allStore.increment">
          <AtomIcon name="plus" />
          加一
        </AtomButton>
      </div>
    </section>

    <section class="mx-auto mt-8 max-w-xl rounded-2xl border border-gray-200 p-8 text-center">
      <h2 class="text-h5 text-txt-dark">
        視窗寬度
      </h2>
      <p class="text-body mt-4 text-txt">
        {{ windowWidth }}px
      </p>
    </section>

    <section class="mx-auto mt-8 max-w-xl rounded-2xl border border-gray-200 p-8 text-center">
      <h2 class="text-h5 text-txt-dark">
        全頁 Loading
      </h2>
      <AtomButton class="mt-6" intent="primary" @click="simulateLoading">
        模擬 1.5 秒 Loading
      </AtomButton>
    </section>

    <LayoutPageLoading :show="pageLoading" text="載入中…" />
  </div>
</template>

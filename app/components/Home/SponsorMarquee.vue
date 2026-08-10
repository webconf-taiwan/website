<script setup>
const { app } = useRuntimeConfig()
const asset = f => `${app.baseURL}sponsors/${f}`.replace(/\/{2,}/g, '/')

const sponsors = [
  { name: '五倍學院', file: 'wubei.svg', h: 'h-8' },
  { name: '六角學院', file: 'liuchiao.svg', h: 'h-8' },
  { name: '悠識學院 userxper', file: 'yushi.svg', h: 'h-8' },
  { name: '鈦坦科技 TITANSOFT', file: 'titansoft.png', h: 'h-20', badge: '連續 3 年贊助' },
  { name: '昇新科技 AscentisTech', file: 'ascentis.svg', h: 'h-14' }
]
// 重複多份，確保任何螢幕寬度下 -50% 循環都無縫
const loopList = [...sponsors, ...sponsors, ...sponsors, ...sponsors]

const sectionRef = ref(null)
const trackRef = ref(null)
let loop = null
let st = null

onMounted(() => {
  const { $gsap, $ScrollTrigger } = useNuxtApp()
  if (!$gsap || !trackRef.value) return

  loop = $gsap.to(trackRef.value, {
    xPercent: -50,
    duration: 18,
    ease: 'none',
    repeat: -1
  })

  if ($ScrollTrigger) {
    st = $ScrollTrigger.create({
      trigger: sectionRef.value,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        // 往下滾動 = 正向 (1)，往回滾動 = 反向 (-1)
        $gsap.to(loop, { timeScale: self.direction, duration: 0.4, overwrite: true })
      }
    })
  }
})

onBeforeUnmount(() => {
  st?.kill()
  loop?.kill()
})
</script>

<template>
  <section
    id="sponsors"
    ref="sectionRef"
    class="overflow-hidden bg-[#0a0a0c] py-10"
  >
    <div ref="trackRef" class="flex w-max">
      <div
        v-for="(s, i) in loopList"
        :key="i"
        class="flex w-[200px] shrink-0 flex-col items-center justify-center gap-2 px-8"
      >
        <img
          :src="asset(s.file)"
          :alt="s.name"
          class="w-auto object-contain"
          :class="s.h"
          loading="lazy"
          draggable="false"
        >
        <span
          v-if="s.badge"
          class="bg-white px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.02em] text-[#002eff]"
        >
          {{ s.badge }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  data: { type: Object, required: true },
})

const expanded = ref(false)
const cardRef = ref(null)
const nuxtApp = useNuxtApp()
const descriptionId = `sponsor-description-${useId()}`
const paragraphs = computed(() => props.data.description?.split('\n\n').filter(Boolean) || [])

async function toggleDescription() {
  const collapsing = expanded.value
  expanded.value = !expanded.value
  await nextTick()
  nuxtApp.$lenis?.resize()
  nuxtApp.$ScrollTrigger?.refresh()

  // 長介紹收合後，卡片可能已在視窗上方；讓讀者仍能看到剛操作的卡片。
  if (collapsing && cardRef.value) {
    const offset = (document.querySelector('header')?.getBoundingClientRect().height || 0) + 16
    const top = cardRef.value.getBoundingClientRect().top
    if (top < offset) {
      const target = Math.max(0, window.scrollY + top - offset)
      if (nuxtApp.$lenis) nuxtApp.$lenis.scrollTo(target, { immediate: true, force: true })
      else window.scrollTo(0, target)
    }
  }
}
</script>

<template>
  <article ref="cardRef" class="sponsor-card" :data-sponsor-id="data.id">
    <div class="sponsor-card-logo">
      <component
        :is="data.link?.href ? 'a' : 'span'"
        :href="data.link?.href"
        :target="data.link?.target"
        :rel="linkRel(data.link?.target)"
        :aria-label="data.link?.href ? `${data.name}官方網站${data.link.target === '_blank' ? '（另開視窗）' : ''}` : data.name"
        class="sponsor-card-logo-link"
      >
        <span v-if="data.logo_mask" class="sponsor-card-logo-mask" :style="{ maskImage: `url(${data.logo_mask})` }" role="img" :aria-label="data.name" />
        <img v-else :src="data.logo" :alt="data.name" :width="data.logo_width || 150" height="120" loading="lazy" decoding="async">
      </component>
    </div>

    <div class="sponsor-card-content">
      <div class="sponsor-card-heading">
        <h3 class="text-zh-h3">{{ data.display_name || data.name }}</h3>
        <span v-if="data.badge" class="sponsor-card-badge text-body-sm">{{ data.badge }}</span>
      </div>

      <ul v-if="data.socials?.length" class="sponsor-card-socials" :aria-label="`${data.name}的相關連結`">
        <li v-for="social in data.socials" :key="social.icon">
          <a v-if="social.href" :href="social.href" :aria-label="`${data.name}的 ${social.label}（另開視窗）`" target="_blank" rel="noopener noreferrer" class="sponsor-card-social">
            <img v-if="social.icon === 'youtube'" src="/sponsors/youtube.svg" width="24" height="24" alt="">
            <AtomIcon v-else :name="social.icon" :class="{ 'p-[3px]': social.icon === 'globe' }" />
          </a>
          <span v-else class="sponsor-card-social" role="img" :aria-label="`${social.label} 網址待提供`">
            <img v-if="social.icon === 'youtube'" src="/sponsors/youtube.svg" width="24" height="24" alt="">
            <AtomIcon v-else :name="social.icon" :class="{ 'p-[3px]': social.icon === 'globe' }" />
          </span>
        </li>
      </ul>

      <div v-if="paragraphs.length" :id="descriptionId" class="sponsor-card-description text-zh-body-md text-pre-800/[62%]" :class="{ 'is-expanded': expanded }">
        <p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p>
      </div>
      <button v-if="paragraphs.length" type="button" class="sponsor-card-toggle text-zh-btn text-pre-800/[62%]" :aria-expanded="expanded" :aria-controls="descriptionId" @click="toggleDescription">
        {{ expanded ? '收合詳細介紹' : '展開詳細介紹' }}
        <AtomIcon :name="expanded ? 'minus' : 'plus'" class="size-5" />
      </button>
    </div>
  </article>
</template>

<style scoped>
/* 內框不占版面，保持設計稿的卡片寬度與左右 24px 內距。 */
.sponsor-card { min-width: 0; box-shadow: inset 0 0 0 1px rgb(239 230 210 / 35%); background: rgb(10 10 12 / 70%); backdrop-filter: blur(5px); }
.sponsor-card-logo { display: flex; justify-content: center; height: 120px; margin: 0 auto; border-bottom: 1px solid rgb(239 230 210 / 35%); }
.sponsor-card-logo-link { display: flex; align-items: center; justify-content: center; max-width: 100%; }
.sponsor-card-logo img { width: auto; height: 120px; max-width: 100%; object-fit: contain; }
.sponsor-card-logo-mask { width: 181.27px; height: 94px; background: currentColor; mask-size: contain; mask-position: center; mask-repeat: no-repeat; }
.sponsor-card-content { display: flex; flex-direction: column; gap: 16px; padding: 16px 24px 24px; }
.sponsor-card-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.sponsor-card-heading h3 { min-width: 0; overflow-wrap: anywhere; }
.sponsor-card-badge { flex-shrink: 0; margin-block: 4px; padding: 2px 4px; color: #0a0a0c; background: #efe6d2; white-space: nowrap; }
.sponsor-card-socials { display: flex; flex-wrap: wrap; gap: 4px; border-top: 1px dashed rgb(239 230 210 / 35%); padding-top: 12px; }
.sponsor-card-social { position: relative; display: grid; width: 28px; height: 28px; place-items: center; }
.sponsor-card-description { display: none; overflow-wrap: anywhere; }
.sponsor-card-description.is-expanded { display: block; }
.sponsor-card-description p + p { margin-top: 1.6em; }
.sponsor-card-toggle { position: relative; display: flex; align-items: center; justify-content: center; align-self: stretch; gap: 4px; min-height: 20px; font-weight: 500; touch-action: manipulation; }
.sponsor-card-toggle::after, a.sponsor-card-social::after { content: ''; position: absolute; inset: -8px 0; }
.sponsor-card-toggle::after { bottom: -16px; }
.sponsor-card a:focus-visible, .sponsor-card-toggle:focus-visible { outline: 1px solid currentColor; outline-offset: 4px; }

@media (hover: hover) {
  .sponsor-card a:hover, .sponsor-card-toggle:hover { color: #7cc8f2; }
}

@media (min-width: 1024px) {
  .sponsor-card-logo { width: 88%; height: 220px; }
  .sponsor-card-logo img { height: 220px; }
  .sponsor-card-logo-mask { width: 332.32px; height: 172.33px; }
  .sponsor-card-description { display: block; }
  .sponsor-card-toggle { display: none; }
}
</style>

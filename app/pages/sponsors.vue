<script setup>
const sponsors = await useSponsorsData()
const contentRef = ref(null)
useFadeIn(contentRef)

const title = '贊助廠商 · WebConf'
const description = '成為 WebConf Taiwan 2026 的合作夥伴，與開發者、設計師及技術社群交流，一起支持台灣的 Web 社群。'
useSeoMeta({ title, description, ogTitle: title, ogDescription: description, twitterTitle: title, twitterDescription: description })
defineOgImage('Default', { title, description })
</script>

<template>
  <CommonPlatePage
    class="sponsors-page"
    :plate="sponsors.plate"
    title="SPONSORS"
    subtitle="贊助廠商"
    aria-label="Sponsors"
    :corner-left="sponsors.corner_left"
    :corner-right="sponsors.corner_right"
    rail-start="body"
  >
    <template #hero-actions>
      <AtomButton
        data-fade="in"
        class="mt-8 hidden h-10 lg:flex"
        :href="sponsors.sections[0].cta.href"
        :text="sponsors.sections[0].cta.label"
        size="sm"
        rounded="none"
        icon="arrow-right-thin"
        icon-position="end"
      />
    </template>

    <template #between>
      <SponsorsPhotoWall :data="sponsors.gallery" />
    </template>

    <div ref="contentRef" class="sponsors-content mx-5 flex flex-col gap-10 pt-8 lg:mx-0 lg:gap-8 lg:pt-0">
      <section
        v-for="section in sponsors.sections"
        :id="section.id"
        :key="section.id"
        :aria-labelledby="`${section.id}-heading`"
        class="sponsor-section flex flex-col gap-6 lg:gap-8 lg:py-8 lg:pl-6"
      >
        <div class="sponsor-section-title flex flex-col gap-2 lg:gap-4">
          <h2 :id="`${section.id}-heading`" data-fade="in" class="text-en-h1 italic">{{ section.title }}</h2>
          <p data-fade="in" class="text-zh-h4">{{ section.subtitle }}</p>
        </div>
        <div class="flex flex-col items-center gap-6 lg:items-start">
          <p data-fade="in" class="sponsor-description w-full max-w-[650px] text-zh-body-lg text-pre-800/[62%]">{{ section.description }}</p>
          <ul class="w-full">
            <li v-for="feature in section.features" :key="feature.en" data-fade="in" class="sponsor-feature border-b border-dashed border-pre-800/35 py-4">
              <div class="flex items-center gap-1">
                <AtomIcon name="plus" class="size-5 shrink-0 text-accent-1" aria-hidden="true" />
                <h3 class="text-en-caption italic">{{ feature.en }}</h3>
              </div>
              <p class="pl-6 text-zh-body-lg">{{ feature.zh }}</p>
            </li>
          </ul>
          <AtomButton
            data-fade="in"
            :href="section.cta.href"
            :text="section.cta.label"
            class="sponsor-cta h-10"
            size="sm"
            rounded="none"
            icon="arrow-right-thin"
            icon-position="end"
          />
        </div>
      </section>
    </div>
  </CommonPlatePage>
</template>

<style scoped>
/* Sponsor-specific sizing keeps the reused agenda hero unchanged. */
.sponsors-page :deep([data-plate-rail-note]) { display: none; }
.sponsors-page :deep([data-plate-hero-mobile] h1),
.sponsors-page :deep([data-plate-hero-desktop] h1),
.sponsors-page :deep(.photo-heading h2),
.sponsor-section h2 { font-weight: 400; letter-spacing: 0.02em; }
.sponsors-page :deep(.text-en-caption) { font-weight: 400; }

@media (max-width: 1023px) {
  .sponsors-page :deep(.sponsor-cta) { padding-left: 20px; padding-right: 12px; }

  .sponsor-section + .sponsor-section {
    border-top: 1px solid rgb(239 230 210 / 35%);
    padding-top: 24px;
  }

  .sponsors-page :deep([data-plate-hero-mobile] > .absolute.left-1\/2) {
    width: calc(100% - 32px);
  }

  .sponsors-page :deep([data-plate-hero-mobile] h1) {
    font-size: clamp(56px, 17.78vw, 64px);
  }

  .sponsors-page :deep([data-plate-hero-mobile] h1 + p) { font-size: 18px; letter-spacing: 0.02em; }
}

@media (min-width: 1024px) {
  .sponsors-page :deep([data-plate-body] > aside) { padding-top: 60px; }
  .sponsors-page :deep([data-plate-hero-desktop] h1 + p) { letter-spacing: 0.02em; }
  .sponsors-page :deep([data-plate-hero-desktop] a),
  .sponsor-cta { padding-left: 20px; }

  .sponsor-section { box-shadow: inset 0 1px rgb(239 230 210 / 35%); }
  .sponsor-section-title { min-height: 127px; }
  .sponsor-section:first-child .sponsor-description { min-height: 145px; }
  .sponsor-section:last-child .sponsor-description { min-height: 116px; }
  .sponsor-feature {
    min-height: 81px;
    border-bottom: 0;
    background-image: linear-gradient(to right, rgb(239 230 210 / 35%) 50%, transparent 0);
    background-size: 4px 1px;
    background-repeat: repeat-x;
    background-position: bottom;
  }
}
</style>

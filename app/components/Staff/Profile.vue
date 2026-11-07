<script setup>
defineProps({
  data: { type: Object, required: true },
})
</script>

<template>
  <article class="staff-profile">
    <div class="staff-portrait">
      <img :src="data.photo" :alt="data.name" width="401" height="572" loading="lazy" decoding="async">
      <p class="staff-spec text-meta text-pre-800/[62%]">{{ data.spec }}</p>
    </div>

    <div class="staff-details">
      <div class="flex flex-col gap-2">
        <h3 class="font-zh-serif text-fs-zh-h5 font-medium">{{ data.name }}</h3>
        <p class="text-body-sm text-pre-800/[62%]">{{ data.role }}</p>
      </div>
      <ul class="staff-socials" :aria-label="`${data.name}的社群帳號`">
        <li v-for="social in data.socials" :key="social.icon">
          <a
            v-if="social.href"
            :href="social.href"
            :aria-label="`${data.name}的 ${social.label}（另開視窗）`"
            target="_blank"
            rel="noopener noreferrer"
            class="staff-social-link"
          >
            <AtomIcon :name="social.icon" />
          </a>
          <!-- 設計稿的示意帳號沒有網址；保留圖示，不建立假的連結。 -->
          <span v-else class="staff-social-placeholder" :aria-label="`${social.label} 網址待提供`" role="img">
            <AtomIcon :name="social.icon" />
          </span>
        </li>
      </ul>
    </div>
  </article>
</template>

<style scoped>
.staff-profile { display: flex; align-items: flex-start; gap: 16px; padding: 24px 0; }
.staff-portrait {
  position: relative;
  flex: 0 0 100px;
  width: 100px;
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px solid rgb(239 230 210 / 35%);
}
.staff-portrait img {
  position: absolute;
  top: -3.88%;
  left: 50%;
  width: 101.78%;
  max-width: none;
  height: 127.18%;
  transform: translateX(-50%);
  object-fit: cover;
}
.staff-spec { display: none; }
.staff-details { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 8px; }
.staff-details h3, .staff-details p { overflow-wrap: anywhere; }
.staff-socials { display: flex; flex-wrap: wrap; gap: 4px; border-top: 1px dashed rgb(239 230 210 / 35%); padding-top: 8px; }
.staff-social-link, .staff-social-placeholder { display: grid; place-items: center; width: 28px; height: 28px; }
.staff-social-link { transition: color 150ms; }
.staff-social-link:hover, .staff-social-link:focus-visible { color: #7cc8f2; }
.staff-social-link:focus-visible { outline: 1px solid currentColor; outline-offset: 2px; }

@media (min-width: 1024px) {
  .staff-profile { min-height: 354px; flex-direction: column; gap: 14px; padding: 0; }
  .staff-portrait { flex: none; width: 100%; }
  .staff-portrait img {
    top: calc(-3.88% - 0.22px);
    left: calc(50% + 0.49px);
    width: calc(101.78% + 0.41px);
    height: calc(127.18% + 0.51px);
  }
  .staff-spec { display: block; position: absolute; top: 3px; left: 7px; }
  .staff-details { flex: none; width: 100%; gap: 12px; }
  .staff-details h3 { line-height: 26px; }
  .staff-details p { line-height: 20px; }
  .staff-socials { padding-top: 11px; }
}

@media (max-width: 1023px) {
  .staff-details h3 { font-size: 18px; line-height: 22px; letter-spacing: 0.02em; }
  .staff-details p { line-height: 20px; }
  .staff-socials { padding-top: 7px; }
  .staff-portrait { border-width: 0.485px; }
  .staff-portrait img {
    top: calc(-3.88% - 0.52px);
    left: calc(50% + 1.18px);
    width: calc(101.78% + 0.98px);
    height: calc(127.18% + 1.23px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .staff-social-link { transition: none; }
}
</style>

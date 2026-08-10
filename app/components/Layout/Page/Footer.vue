<script setup>
const socials = [
  { label: 'mail', href: 'mailto:blockstudiotw@gmail.com' },
  { label: 'Facebook', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'Threads', href: '#' }
]

function toTop () {
  const { $lenis } = useNuxtApp()
  if ($lenis?.scrollTo) $lenis.scrollTo(0)
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <footer class="relative flex flex-col items-center gap-[60px] bg-[#0a0a0c] px-6 py-16 md:px-16 lg:px-[170px] lg:py-[60px]">
    <!-- 行為準則 Code of Conduct -->
    <div class="flex w-full flex-col gap-4">
      <p class="text-[20px] font-semibold leading-tight text-white">
        行為準則 CODE OF CONDUCT
      </p>
      <p class="text-caption tracking-[0.08em] text-[#efe6d2]">
        WebConf Taiwan 致力於為所有參與者提供一個無騷擾、尊重且包容的會議環境。我們堅決反對任何形式的騷擾，包括性別歧視、種族主義或排他性笑話，並期望所有參與者在會議期間（包括數位平台）都能遵守這些準則。我們鼓勵大家共同合作，確保每位成員都能享有平等、尊重的會議體驗。感謝您的配合與支持，讓我們一起努力，打造一個開放、尊重和創新的會議平台。
      </p>
      <p class="text-caption tracking-[0.08em] text-[#efe6d2]">
        WebConf Taiwan is committed to providing a harassment-free, respectful, and inclusive environment for all participants. We firmly oppose any form of harassment, including sexism, racism, or exclusionary jokes, and expect all participants to adhere to these guidelines throughout the conference, including on digital platforms. We encourage everyone to work together to ensure that every individual enjoys an equitable and respectful conference experience. Thank you for your cooperation and support as we strive to create an open, respectful, and innovative conference platform.
      </p>
    </div>

    <!-- 社群 + 版權 -->
    <div class="flex flex-col items-center gap-6">
      <ul class="flex flex-wrap items-center justify-center gap-6">
        <li v-for="s in socials" :key="s.label">
          <a
            :href="s.href"
            class="text-[10px] font-semibold capitalize text-white transition-colors hover:text-[#71c1f0]"
          >
            {{ s.label }}
          </a>
        </li>
      </ul>
      <p class="text-[12px] text-[#bcbcbc]">
        Contact Us | Facebook | WebConf Taiwan 2025 All Rights Reserved.
      </p>
    </div>

    <!-- 回到頂部 -->
    <button
      type="button"
      aria-label="回到頂部"
      class="absolute right-6 top-5 flex size-10 items-center justify-center rounded-full border border-[#002eff] bg-[#e6e6e6] text-[#002eff] transition hover:bg-white lg:right-[70px]"
      @click="toTop"
    >
      <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  </footer>
</template>

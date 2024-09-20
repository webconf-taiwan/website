<script setup lang="ts">
const contactInfos = [
  {
    iconName: 'heroicons:envelope',
    content: 'hi@webconf.tw',
    href: 'mailto:hi@webconf.tw',
  },
  {
    iconSrc: '/footer/fb.svg',
    content: 'WebConf Taiwan',
    href: 'https://www.facebook.com/WebConfTaiwan/?locale=zh_TW',
  },
]
</script>

<template>
  <section
    class="full-bleed relative bg-black px-5 pb-6 pt-[30px] lg:flex lg:justify-center"
  >
    <div class="lg:max-w-[1320px]">
      <ul class="space-y-[10px] border-b border-footer-border py-6 lg:hidden">
        <li
          v-for="(info) in contactInfos"
          :key="info.content"
        >
          <NuxtLink
            :to="info.href"
            :external="!info.href.startsWith('mailto:')"
            class="flex items-center space-x-2 lg:hover:underline"
          >
            <Icon
              v-if="info.iconName"
              :name="info.iconName"
              size="24"
            />
            <NuxtImg
              v-else-if="info.iconSrc"
              :src="info.iconSrc"
              class="w-6"
            />
            <span>{{ info.content }}</span>
          </NuxtLink>
        </li>
      </ul>

      <div class="pt-6">
        <div class="flex space-x-3 font-bold">
          <h4 class="text-xl lg:text-2xl">
            CODE OF CONDUCT
          </h4>
          <p>行為準則</p>
        </div>

        <p class="mt-4 leading-7">
          WebConf Taiwan 致力於為所有參與者提供一個無騷擾、尊重且包容的會議環境。我們堅決反對任何形式的騷擾，包括性別歧視、種族主義或排他性笑話，並期望所有參與者在會議期間（包括數位平台）都能遵守這些準則。<br>我們鼓勵大家共同合作，確保每位成員都能享有平等、尊重的會議體驗。感謝您的配合與支持，讓我們一起努力，打造一個開放、尊重和創新的會議平台。
        </p>
      </div>

      <div
        class="text-mina mt-4 border-t border-footer-border py-4 text-sm uppercase lg:mt-6 lg:pt-5"
      >
        <p class="lg:hidden">
          WebConf Taiwan 2024 All Rights <br>Reserved.
        </p>
        <p class="hidden lg:block lg:text-center">
          WebConf Taiwan 2024 All Rights Reserved.
        </p>
      </div>
    </div>

    <div class="absolute left-1/2 top-5 w-14 -translate-x-1/2">
      <NuxtImg
        src="/footer/bar.svg"
        class="w-full"
      />
    </div>

    <div class="trapezoid trapezoid-top-left">
      <NuxtLink
        to="mailto:hi@webconf.tw"
        class="hidden h-full items-center justify-center space-x-2 lg:flex lg:hover:underline"
      >
        <Icon
          name="heroicons:envelope"
          size="24"
        />
        <span>hi@webconf.tw</span>
      </NuxtLink>
    </div>
    <div class="trapezoid trapezoid-top-right">
      <NuxtLink
        to="https://www.facebook.com/WebConfTaiwan/?locale=zh_TW"
        class="hidden h-full items-center justify-center space-x-2 lg:flex lg:hover:underline"
      >
        <NuxtImg
          src="/footer/fb.svg"
          class="w-6"
        />
        <span>WebConf Taiwan</span>
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.trapezoid {
  background-color: black;
  position: absolute;
  top: 0;
  transform: translateY(calc(-100% + 24px));
  height: 60px;
}

.trapezoid-top-left {
  left: 0;
  width: clamp(140px, 30dvw, 360px);
  clip-path: polygon(0% 0%, calc(100% - 36px) 0%, 100% 100%, 0% 100%);
}

.trapezoid-top-right {
  right: 0;
  width: clamp(140px, 30dvw, 360px);
  clip-path: polygon(calc(0% + 36px) 0%, 100% 0%, 100% 100%, 0% 100%);
}
</style>

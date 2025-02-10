<script setup lang="ts">
import { contactInfos } from '@/constants'
</script>

<template>
  <footer class="full-bleed relative bg-black px-5 py-[30px] md:pb-6 lg:flex lg:justify-center">
    <div class="lg:max-w-[1320px]">
      <ul class="space-y-[10px] border-b border-footer-border py-6 lg:hidden">
        <li
          v-for="info in contactInfos"
          :key="info.href"
        >
          <NuxtLink
            :to="info.href"
            target="_blank"
            :external="!info.href.startsWith('mailto:')"
            :aria-label="info.ariaLabel"
            class="flex items-center space-x-2 lg:hover:underline"
          >
            <Icon
              :name="info.iconName"
              size="24"
            />
            <span>{{ info.content }}</span>
          </NuxtLink>
        </li>
      </ul>

      <div class="pt-6">
        <div class="flex items-center space-x-3 font-bold">
          <h2 class="text-xl lg:text-2xl">
            行為準則
          </h2>
          <p>CODE OF CONDUCT</p>
        </div>

        <p class="mt-4 leading-7">
          WebConf Taiwan
          致力於為所有參與者提供一個無騷擾、尊重且包容的會議環境。我們堅決反對任何形式的騷擾，包括性別歧視、種族主義或排他性笑話，並期望所有參與者在會議期間（包括數位平台）都能遵守這些準則。我們鼓勵大家共同合作，確保每位成員都能享有平等、尊重的會議體驗。感謝您的配合與支持，讓我們一起努力，打造一個開放、尊重和創新的會議平台。
        </p>
        <p class="mt-4 leading-7">
          WebConf Taiwan is committed to providing a harassment-free, respectful, and inclusive environment for all
          participants. We firmly oppose any form of harassment, including sexism, racism, or exclusionary jokes, and
          expect all participants to adhere to these guidelines throughout the conference, including on digital
          platforms. We encourage everyone to work together to ensure that every individual enjoys an equitable and
          respectful conference experience. Thank you for your cooperation and support as we strive to create an open,
          respectful,
          and innovative conference platform.
        </p>
      </div>

      <div class="py-4 mt-4 text-sm uppercase border-t text-mina border-footer-border lg:mt-6 lg:pt-5">
        <p class="lg:hidden">
          WebConf Taiwan 2024 All Rights <br>Reserved.
        </p>
        <p class="hidden lg:block lg:text-center">
          WebConf Taiwan 2024 All Rights Reserved.
        </p>
      </div>
    </div>

    <div class="absolute -translate-x-1/2 left-1/2 top-5 w-14">
      <NuxtImg
        src="/footer/bar.svg"
        alt="decorative bar"
        class="w-full"
      />
    </div>

    <div
      v-for="info in contactInfos"
      :key="info.href"
      :class="info.trapezoidClass"
      class="trapezoid"
    >
      <div class="items-center justify-center hidden h-full lg:flex">
        <NuxtLink
          :to="info.href"
          target="_blank"
          class="flex items-center justify-center space-x-2 lg:underline-offset-2 lg:hover:underline"
        >
          <Icon
            :name="info.iconName"
            size="24"
          />
          <span>{{ info.content }}</span>
        </NuxtLink>
      </div>
    </div>
  </footer>
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

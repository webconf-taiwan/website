<script setup lang="ts">
const COC_STATEMENT
  = 'WebConf Taiwan 致力於為所有參與者提供一個無騷擾、尊重且包容的會議環境。我們堅決反對任何形式的騷擾，包括性別歧視、種族主義或排他性笑話，並期望所有參與者在會議期間（包括數位平台）都能遵守這些準則。我們鼓勵大家共同合作，確保每位成員都能享有平等、尊重的會議體驗。感謝您的配合與支持，讓我們一起努力，打造一個開放、尊重和創新的會議平台。'
</script>

<template>
  <section
    v-arrow="{ speed1: '12s', color: 'white' }"
    class="relative border-t-[0.5px] border-webconf-gray bg-black py-[60px]"
  >
    <div class="container flex items-start gap-8 sm:px-[88px] lg:px-[172px]">
      <ShareTag
        size="md"
        class="my-2"
      >
        CoC 行為準則
      </ShareTag>

      <div class="flex-1 text-body-16 text-webconf-gray">
        {{ COC_STATEMENT }}
      </div>
    </div>
  </section>
</template>

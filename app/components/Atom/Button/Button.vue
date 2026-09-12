<script setup>
import { cva } from 'class-variance-authority'
import { NuxtLink } from '#components'

const props = defineProps({
  intent: {
    type: String,
    default: 'primary',
    validator: value => ['primary', 'secondary', 'link', 'tag', 'outline', 'specimen'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: value => ['xs', 'sm', 'md', 'lg', 'link'].includes(value)
  },
  position: {
    type: String,
    default: 'center',
    validator: value => ['center', 'start', 'end'].includes(value)
  },
  rounded: {
    type: String,
    default: 'lg',
    validator: value => ['none', 'sm', 'md', 'lg', 'full'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: 'Button'
  },
  href: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'button'
  },
  title: {
    type: String,
    default: ''
  }
})

const { intent, size, position, disabled, text, href, type, title } = toRefs(props)

// ⚠️ 基底不要再寫 rounded-lg —— 下面已經有 rounded variant，兩邊都輸出的話會同時
// 帶上 rounded-lg 與 rounded-none 兩個 class（cva 不做 tailwind-merge），
// 到底哪個生效只能看 CSS 產出順序。預設值本來就是 lg，拿掉不影響既有外觀。
const button = cva([
  'flex cursor-pointer select-none items-center gap-2 border',
  'transition duration-300'
], {
  variants: {
    intent: {
      primary: [
        'border-gray-800 bg-gray-800 text-white',
        'hover:border-brand hover:bg-brand',
        'focus:border-brand focus:bg-brand focus:outline focus:outline-2 focus:outline-ad/20',
        'active:border-brand active:bg-brand',
        'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-white'
      ],
      secondary: [
        'border-gray-800 bg-white text-gray-800',
        'hover:border-brand hover:text-brand',
        'focus:border-brand focus:text-brand focus:outline focus:outline-brand',
        'active:border-brand active:bg-brand active:text-white',
        'disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-transparent disabled:text-txt-super-light'
      ],
      link: [
        'border-none bg-transparent text-txt',
        'hover:text-brand',
        'disabled:cursor-not-allowed disabled:text-txt-super-light'
      ],
      outline: [
        'border-gray-800 bg-transparent text-gray-800',
        'hover:border-brand hover:text-brand',
        'focus:border-brand focus:text-brand focus:outline focus:outline-brand',
        'active:border-brand active:bg-brand active:text-white',
        'disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-transparent disabled:text-txt-super-light'
      ],
      tag: [
        'border-gray-800 bg-gray-800 text-white',
        'hover:border-brand hover:bg-brand',
        'focus:border-brand focus:bg-brand focus:outline focus:outline-2 focus:outline-ad/20',
        'active:border-brand active:bg-brand',
        'disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-white'
      ],
      // WebConf 2026 深色主題。其他 intent 都是舊設計系統的配色（gray-800 / brand /
      // 白底），套在這個站的黑底上完全不對，所以另開一個而不是改既有的。
      // 字體用 Noto Sans TC 對齊設計 token zh/btn_16px（.text-zh-btn 已經是
      // font-zh-sans，這裡的 !font-zh-sans 是保險，非必要）。
      specimen: [
        'border-accent-1 bg-[#0a0a0c] text-pre-800 font-medium !tracking-[0.1em]',
        'hover:bg-accent-1/10',
        'focus:outline focus:outline-2 focus:outline-accent-1/40',
        'disabled:cursor-not-allowed disabled:border-pre-800/30 disabled:text-pre-800/30'
      ]
    },
    size: {
      xs: ['text-zh-btn py-0.5'],
      sm: ['text-zh-btn px-3 py-1 md:px-4 md:py-2'],
      md: ['text-zh-btn px-5 py-1 md:px-6 md:py-2'],
      lg: ['text-zh-btn px-7 py-2 md:px-8 md:py-2'],
      link: ['px-1 py-2']
    },
    position: {
      center: 'justify-center',
      start: 'justify-start',
      end: 'justify-end'
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full'
    }
  }
})

const component = computed(() => {
  if (href.value && !disabled.value) return NuxtLink

  return 'button'
})
</script>

<template>
  <component
    :is="component"
    :type="href ? null : type"
    :to="href"
    :class="button({ intent, size, position, rounded })"
    :disabled="disabled"
    :title="title || text || '按鈕'"
  >
    <slot>{{ text }}</slot>
  </component>
</template>

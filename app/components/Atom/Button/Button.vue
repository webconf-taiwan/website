<script setup>
import { cva } from 'class-variance-authority'
import { NuxtLink } from '#components'

const props = defineProps({
  intent: {
    type: String,
    default: 'primary',
    validator: value => ['primary', 'secondary', 'link', 'tag', 'outline'].includes(value)
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
  },
  icon: {
    type: String,
    default: ''
  },
  iconPosition: {
    type: String,
    default: 'start',
    validator: value => ['start', 'end'].includes(value)
  },
  iconSize: {
    type: String,
    default: 'md',
    validator: value => ['xs', 'sm', 'md', 'lg'].includes(value)
  } 
})

const { intent, size, position, disabled, text, href, type, title, icon, iconPosition, iconSize } = toRefs(props)

// 有 icon 的那一側改成固定 12px（設計稿量出來的值，不像文字那側會隨 breakpoint 縮放），
// 另一側維持原本 size 的水平間距。拆成獨立的 lookup 而不是塞進 cva 的 size variant，
// 是因為 cva 只會疊加 class、不會覆蓋 —— 兩個 px-* 同時存在時誰生效要看 Tailwind
// 產出的 CSS 順序，不保證是後寫的那個贏，容易踩雷。這裡改成每種情況各自一組完整、
// 互斥的 class 字串，一次只會有一組被套用。
const PADDING_X = {
  xs: { none: '', start: 'pl-3', end: 'pr-3' },
  sm: { none: 'px-3 md:px-4', start: 'pl-3 pr-3 md:pr-4', end: 'pr-3 pl-3 md:pl-4' },
  md: { none: 'px-4 md:px-5', start: 'pl-3 pr-4 md:pr-5', end: 'pr-3 pl-4 md:pl-5' },
  lg: { none: 'px-7 md:px-8', start: 'pl-3 pr-7 md:pr-8', end: 'pr-3 pl-7 md:pl-8' },
  link: { none: 'px-1', start: 'pl-3 pr-1', end: 'pr-3 pl-1' }
}

const ICON_SIZE_CLASS = { xs: 'size-4', sm: 'size-5', md: 'size-6', lg: 'size-7' }

const paddingX = computed(() => PADDING_X[size.value][icon.value ? iconPosition.value : 'none'])
const iconSizeClass = computed(() => ICON_SIZE_CLASS[iconSize.value])

// ⚠️ 基底不要再寫 rounded-lg —— 下面已經有 rounded variant，兩邊都輸出的話會同時
// 帶上 rounded-lg 與 rounded-none 兩個 class（cva 不做 tailwind-merge），
// 到底哪個生效只能看 CSS 產出順序。預設值本來就是 lg，拿掉不影響既有外觀。
const button = cva([
  'flex cursor-pointer select-none items-center border',
  'transition duration-300'
], {
  variants: {
    intent: {
      // WebConf 2026 深色主題（Figma btn component）。border 用 theme/accent-1，
      // 字體用 Noto Sans TC 對齊設計 token zh/btn_16px（.text-zh-btn 已經是
      // font-zh-sans，這裡的 !font-zh-sans 是保險，非必要）。
      primary: [
        'border-accent-1 bg-[#0a0a0c] text-pre-800 font-medium !tracking-[0.1em]',
        // 設計稿的 hover 不是把黑底整個換成淡藍（那樣底色會被沖淡、變得快透明），
        // 是疊一層 20% 透明的 #71c1f0 在原本的黑底「上面」，黑底本身還在、只是被染色。
        // 單一 bg-color 疊不出這個效果，用兩層 background-image 堆出來。
        'hover:bg-[linear-gradient(0deg,rgba(113,193,240,0.2),rgba(113,193,240,0.2)),linear-gradient(0deg,#0a0a0c,#0a0a0c)]',
        'focus:outline focus:outline-2 focus:outline-accent-1/40',
        'disabled:cursor-not-allowed disabled:border-pre-800/30 disabled:text-pre-800/30'
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
      ]
    },
    size: {
      xs: ['text-zh-btn py-0.5'],
      sm: ['text-zh-btn py-1 md:py-2'],
      md: ['text-zh-btn py-2 md:py-3'],
      lg: ['text-zh-btn py-2 gap-2 md:py-4'],
      link: ['py-2']
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
    :class="[button({ intent, size, position, rounded }), paddingX]"
    :disabled="disabled"
    :title="title || text || '按鈕'"
  >
    <AtomIcon v-if="icon && iconPosition === 'start'" :name="icon" is-full :class="iconSizeClass" />
    <slot>{{ text }}</slot>
    <AtomIcon v-if="icon && iconPosition === 'end'" :name="icon" is-full :class="iconSizeClass" />
  </component>
</template>

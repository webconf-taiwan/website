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
    validator: value => ['sm', 'md', 'lg', 'full'].includes(value)
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

const button = cva([
  'flex cursor-pointer select-none items-center gap-2 rounded-lg border',
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
      ]
    },
    size: {
      xs: ['text-btn py-0.5'],
      sm: ['text-btn px-3 py-1 md:px-4 md:py-2'],
      md: ['text-btn px-5 py-1 md:px-6 md:py-2'],
      lg: ['text-btn px-7 py-2 md:px-8 md:py-2'],
      link: ['px-1 py-2']
    },
    position: {
      center: 'justify-center',
      start: 'justify-start',
      end: 'justify-end'
    },
    rounded: {
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

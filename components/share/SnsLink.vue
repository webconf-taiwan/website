<script setup lang="ts">
const props = defineProps<{
  name: string
  link: string
}>()

const snsInfo = computed(() => {
  const linkLower = props.link.toLowerCase()
  if (linkLower.includes('facebook')) {
    return {
      icon: '/images/icon/fb.svg',
      platform: 'Facebook',
    }
  }
  if (linkLower.includes('instagram')) {
    return {
      icon: '/images/icon/ig.svg',
      platform: 'Instagram',
    }
  }
  if (linkLower.includes('twitter')) {
    return {
      icon: '/images/icon/twitter.svg',
      platform: 'Twitter',
    }
  }
  if (linkLower.includes('linkedin')) {
    return {
      icon: '/images/icon/linkedin.svg',
      platform: 'LinkedIn',
    }
  }
  if (linkLower.includes('youtube')) {
    return {
      icon: '/images/icon/youtube.svg',
      platform: 'YouTube',
    }
  }
  if (linkLower.includes('threads')) {
    return {
      icon: '/images/icon/threads.svg',
      platform: 'Threads',
    }
  }
  return {
    icon: '/images/icon/web.svg',
    platform: '網站',
  }
})
</script>

<template>
  <a
    :href="link"
    class="block border border-webconf-blue/90 p-[10px] transition-colors duration-500 hover:bg-webconf-blue"
    target="_blank"
    rel="noopener noreferrer"
  >
    <NuxtImg
      :src="snsInfo.icon"
      :alt="`前往 ${props.name} 的 ${snsInfo.platform}`"
      width="24"
      height="24"
    />
  </a>
</template>

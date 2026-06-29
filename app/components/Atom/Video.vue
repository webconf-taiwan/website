<script setup>
const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  videoSrc: {
    type: String,
    default: ''
  },
  videoAspect: {
    type: Boolean,
    default: true
  },
  autoplay: {
    type: Boolean,
    default: false
  },
  muted: {
    type: Boolean,
    default: false
  },
  loop: {
    type: Boolean,
    default: false
  },
  playsinline: {
    type: Boolean,
    default: false
  },
  coverImage: {
    type: String,
    default: ''
  },
  isYtVideo: {
    type: Boolean,
    default: false
  },
  isRounded: {
    type: Boolean,
    default: false
  },
  pause: {
    type: Boolean,
    default: false
  },
  controls: {
    type: Boolean,
    default: false
  }
})

const {
  id,
  videoSrc,
  videoAspect,
  autoplay,
  muted,
  loop,
  playsinline,
  coverImage,
  isYtVideo,
  isRounded,
  pause,
  controls
} = toRefs(props)

const isAutoPlay = ref(autoplay.value && !coverImage.value)
const video = ref(null)
const ytVideo = ref(null)
const player = ref(null)
const isPlay = ref(false)

function playVideo () {
  isPlay.value = true

  if (isYtVideo.value) {
    player.value?.playVideo()
    return
  }

  video.value?.play()
}

function pauseVideo () {
  isPlay.value = false

  if (isYtVideo.value) {
    player.value?.pauseVideo()
    return
  }

  video.value?.pause()
}

watch(pause, (value) => {
  if (value) {
    pauseVideo()
    return
  }

  if (autoplay.value) playVideo()
})

function ensureYouTubeApi () {
  if (window.YT?.Player) return Promise.resolve()
  if (window.__ytApiPromise) return window.__ytApiPromise

  window.__ytApiPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReady === 'function') previousReady()
      resolve()
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    document.head.appendChild(script)
  })

  return window.__ytApiPromise
}

function initYouTubePlayer (target, videoId) {
  window.YT.ready(() => {
    player.value = new window.YT.Player(target, {
      height: '100%',
      width: '100%',
      videoId: videoId || '',
      playerVars: {
        autoplay: autoplay.value ? 1 : 0,
        controls: controls.value ? 1 : 0,
        fs: 1,
        iv_load_policy: 3,
        rel: 0,
        modestbranding: 1,
        playsinline: 1
      }
    })
  })
}

onMounted(async () => {
  if (!isYtVideo.value) return

  await ensureYouTubeApi()
  initYouTubePlayer(ytVideo.value, videoSrc.value)
})
</script>

<template>
  <div
    class="relative w-full overflow-hidden"
    :class="{
      'aspect-video': videoAspect,
      'rounded-3xl': isRounded
    }"
  >
    <button
      v-if="coverImage || !controls"
      type="button"
      class="group/cover absolute inset-0 z-1 flex cursor-pointer items-center justify-center bg-black/20 duration-300 hover:bg-black/40"
      :class="{ 'pointer-events-none opacity-0': isPlay }"
      :style="coverImage ? `background-image: url('${coverImage}'); background-size: cover; background-position: center;` : null"
      aria-label="播放影片"
      @click="playVideo"
    >
      <AtomIcon name="play" class="relative z-2 size-10 text-white lg:size-20" is-full />
    </button>

    <div
      v-if="isYtVideo"
      :id="id"
      ref="ytVideo"
      class="size-full"
    ></div>

    <video
      v-else
      :id="id"
      ref="video"
      class="size-full object-cover"
      :src="videoSrc"
      :autoplay="isAutoPlay"
      :muted="muted"
      :loop="loop"
      :playsinline="playsinline"
      :controls="controls"
    ></video>
  </div>
</template>

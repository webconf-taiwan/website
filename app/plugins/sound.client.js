import { createSoundEngine } from '~/utils/soundEngine'

// 背景音的狀態與生命週期（引擎本身見 utils/soundEngine.js）。
//
// 規則：
//   - 預設開。使用者在 header 的開關關掉／打開後記在 localStorage，下次進站照舊。
//   - 瀏覽器規定「使用者互動之前不能出聲」，所以開著的狀態下，第一次點擊／觸控／按鍵
//     才真的開始（AudioContext.resume）。不另外跳提示問。
//   - loading 音（Intro.vue 呼叫 introStart / introLock）只有在那當下瀏覽器已經允許出聲
//     才會響 —— 第一次進站、還沒互動過的人通常聽不到，這是瀏覽器的限制。
//   - loading 結束（introDone）後才淡入背景音；分頁切到背景時暫停。
//   - 場景：依路由決定；首頁再依畫面上佔最多的區塊（#about、#speaker…）切換和聲。
//
// 用法：const sound = useSiteSound()（composables/useSiteSound.js）

const STORAGE_KEY = 'webconf-sound'
const AUDIO_BASE = '/audio'
// 這些頁面不放背景音：試聽頁自己有音訊，放了會打架
const MUTED_ROUTES = ['/sound-lab']
const ROUTE_SCENES = { '/': 'hero', '/agenda': 'agenda', '/coming-soon': 'quiet', '/404-demo': 'quiet' }
const HOME_SECTIONS = ['about', 'speaker', 'venue', 'faq', 'ticket']

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const { introDone } = useSiteIntro()

  const readPref = () => { try { return localStorage.getItem(STORAGE_KEY) !== 'off' } catch { return true } }
  const enabled = ref(readPref())
  const audible = ref(false)          // AudioContext 真的在跑（瀏覽器允許出聲了）

  let ctx = null
  let engine = null
  let introState = 'idle'             // idle → building → locked
  let sceneKey = 'default'            // 引擎還沒建（還沒互動）時先記著，建好再套

  function ensureEngine () {
    if (!engine) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      ctx = new AC()
      engine = createSoundEngine(ctx)
      engine.setScene(sceneKey)
      ctx.addEventListener?.('statechange', () => { audible.value = ctx.state === 'running' })
    }
    return engine
  }

  const routeMuted = () => MUTED_ROUTES.includes(router.currentRoute.value.path.replace(/\/$/, '') || '/')

  const wantSound = () => enabled.value && !routeMuted()
  let suspendTimer = 0

  // 關掉：淡出後把 AudioContext 整個暫停（不只是音量 0，排程與振盪器都停，省 CPU）
  function silence () {
    if (!engine) return
    engine.stopIntro()
    engine.stopAmbient(0.6)
    engine.setVolume(0, 0.6)
    clearTimeout(suspendTimer)
    suspendTimer = setTimeout(() => { if (!wantSound()) ctx.suspend() }, 800)
  }

  // 能不能出聲、該不該放背景音 —— 所有狀態變化都走這一支
  // ⚠️ await 之後一定要再檢查一次 wantSound()：第一次就點在開關上時，pointerdown（解鎖 →
  // sync 開聲音）比 click（關掉）先發生，而前者還卡在 await ctx.resume()；不重查的話它
  // 醒來會把剛關掉的聲音又打開 —— 使用者會覺得「按了沒關」。
  async function sync () {
    if (!wantSound()) return silence()
    if (!ensureEngine()) return
    clearTimeout(suspendTimer)
    if (ctx.state !== 'running') {
      try { await ctx.resume() } catch {}
    }
    if (!wantSound()) return silence()
    audible.value = ctx.state === 'running'
    if (!audible.value) return
    engine.setVolume(1)
    if (introDone.value && !engine.isRunning() && !document.hidden) engine.startAmbient()
  }

  // ---- 第一次互動才解鎖（瀏覽器規定）------------------------------------------
  // ⚠️ 只有點擊／觸控／按鍵算「使用者互動」（HTML 規範的 user activation）。滑鼠移動、
  // hover、捲動都不算，瀏覽器不會因為它們放行聲音 —— 這不是網站能改的。
  // 解鎖成功後就拆掉監聽：之後瀏覽器記得這頁已經互動過（sticky activation），
  // 分頁切回來的 resume() 不必再等點擊；開關被關掉時也拆，重新打開靠開關那一下點擊解鎖。
  const unlockEvents = ['pointerdown', 'keydown', 'touchstart']
  const stopListening = () => unlockEvents.forEach(e => window.removeEventListener(e, onFirstGesture, true))
  function onFirstGesture () {
    if (!enabled.value) return stopListening()
    sync().then(() => {
      if (!audible.value || !wantSound()) return
      stopListening()
      // loading 還在跑的時候點了一下 → 從這一刻開始放 loading 音，圓圈畫滿時照常鎖定
      if (!introDone.value && introState === 'idle' && !routeMuted()) {
        introState = 'building'
        engine.playIntroBuild(AUDIO_BASE).catch(() => {})
      }
    })
  }
  if (enabled.value) unlockEvents.forEach(e => window.addEventListener(e, onFirstGesture, true))

  // ---- loading 音（Intro.vue 呼叫）--------------------------------------------
  async function introStart () {
    if (!enabled.value || routeMuted() || !ensureEngine()) return
    // 不等使用者互動：瀏覽器允許就響（例如常來的網站），不允許就安靜略過
    ctx.resume().catch(() => {})
    await new Promise(r => setTimeout(r, 60))
    if (ctx.state !== 'running') return
    introState = 'building'
    engine.playIntroBuild(AUDIO_BASE).catch(() => {})
  }

  function introLock () {
    const wasBuilding = introState === 'building'
    introState = 'locked'   // 沒在響也標成 locked：圓圈畫完之後才點的，不該再從頭放 build
    if (wasBuilding && engine) engine.playIntroLock(AUDIO_BASE).catch(() => {})
  }

  watch(introDone, (v) => { if (v) sync() })

  // ---- 開關 --------------------------------------------------------------------
  function toggle () {
    enabled.value = !enabled.value
    try { localStorage.setItem(STORAGE_KEY, enabled.value ? 'on' : 'off') } catch {}
    sync()   // 點開關本身就是一次互動，打開時可以直接出聲
  }

  // ---- 分頁在背景就暫停 --------------------------------------------------------
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return
    if (document.hidden) ctx.suspend()
    else if (enabled.value && !routeMuted()) sync()
  })

  // ---- 場景 --------------------------------------------------------------------
  let observer = null
  const ratios = {}

  function watchHomeSections () {
    observer?.disconnect()
    if (router.currentRoute.value.path !== '/') return
    observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { ratios[e.target.id] = e.intersectionRatio })
      const [top, ratio] = Object.entries(ratios).sort((a, b) => b[1] - a[1])[0] || []
      setScene(ratio > 0.25 ? top : 'hero')
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] })
    HOME_SECTIONS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
  }

  function setScene (key) {
    sceneKey = key
    engine?.setScene(key)
  }

  function applyRouteScene () {
    const path = router.currentRoute.value.path.replace(/\/$/, '') || '/'
    setScene(ROUTE_SCENES[path] || 'default')
    Object.keys(ratios).forEach(k => delete ratios[k])
    watchHomeSections()
    sync()
  }

  nuxtApp.hook('page:finish', () => requestAnimationFrame(applyRouteScene))
  nuxtApp.hook('app:mounted', () => requestAnimationFrame(applyRouteScene))

  // ---- 給粒子場用：推粒子出一串 blip、收攏時濾波器打開 ----------------------------
  let lastBurst = 0
  function particlePush (strength, panX) {
    if (!audible.value || !engine?.isRunning()) return
    const now = performance.now()
    if (now - lastBurst < 220) return   // 節流：pointermove 一秒上百次
    lastBurst = now
    engine.burst(strength, panX)
  }
  function particleGather (v) {
    engine?.setBrightness(v)
  }

  return {
    provide: {
      sound: { enabled, audible, toggle, introStart, introLock, particlePush, particleGather }
    }
  }
})

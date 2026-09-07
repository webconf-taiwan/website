<script setup>
// ?tool=1 的工具面板。
//
// ─── 它管幾個東西 ──────────────────────────────────────────────────────────
// 「效果切換 + 維持開場構圖」是 hero 專屬的，只有帶了 look 的呼叫端才顯示。
// 「參數微調」則是跟著 useParticleTool 的登記清單走 —— 桌機只有一組（HomeField），
// 窄視窗有兩組（HomeMobileField 的滿版場、HomeSpeakerPortrait 的人像），
// 兩組以上就長出分頁。面板不 import 任何 Field 元件，只讀登記清單。
//
// ─── 三條刻意的設計 ────────────────────────────────────────────────────────
// 1. 草稿制：所有輸入先進 draft，按了「保存」才 emit。
//    因為裡面有兩項非常貴（粒子數量會 respawn 整場、取樣點數要把圖全部重新
//    取樣，每張約 190ms 的主執行緒同步工作），逐項即時套會卡到不能用。
// 2. 不寫網址：邊調邊改 query 會讓人以為畫面在重載。
// 3. 保存列在捲動區外面 → 永遠貼在面板底部，調完不必滾回去找按鈕。
//
// teleport 到 body 是為了不被首頁那層 relative 的 stacking context 綁住。
// 呼叫端用 v-if 控制顯示，而那個旗標要等 onMounted 讀完網址才會是 true，
// 所以 SSR 不會輸出它，也就不會有 hydration 落差。

const props = defineProps({
  // --- hero 效果切換。不給 look 就整區不顯示（手機版沒有這個功能）---------
  look: { type: Object, default: null },
  looks: { type: Array, default: () => [] },
  pinned: { type: Boolean, default: false },
  holdPct: { type: Number, default: 100 },
  // 切換中（重生成粒子 / 重新取樣要一兩秒）→ 按鈕先禁用，避免連點疊在一起
  switching: { type: Boolean, default: false },
})

const emit = defineEmits(['pick', 'hold'])

const { groups } = useParticleTool()

// --- 收合 -------------------------------------------------------------------
// 存 localStorage —— 這是給設計 / 工程反覆開關的工具，每次重整都要再收一次很煩。
// ⚠️ 無痕視窗與「封鎖網站資料」的瀏覽器會直接丟例外（存取器本身就 throw，
// 不是回傳 null），所以讀寫都要包 try。
const OPEN_KEY = 'wc:fieldTool:open'
const HELP_KEY = 'wc:fieldTool:help'
const open = ref(true)
const helpOpen = ref(false)

function readFlag (key, fallback) {
  try {
    const v = localStorage.getItem(key)

    return v === null ? fallback : v === '1'
  } catch {
    return fallback
  }
}

function writeFlag (key, v) {
  try {
    localStorage.setItem(key, v ? '1' : '0')
  } catch { /* 存不了就算了，不是錯誤 */ }
}

onMounted(() => {
  open.value = readFlag(OPEN_KEY, true)
  helpOpen.value = readFlag(HELP_KEY, false)
})

function toggle () {
  open.value = !open.value
  writeFlag(OPEN_KEY, open.value)
}

function toggleHelp () {
  helpOpen.value = !helpOpen.value
  writeFlag(HELP_KEY, helpOpen.value)
}

// --- 分頁 -------------------------------------------------------------------
const activeId = ref(null)
const active = computed(() =>
  groups.value.find(g => g.id === activeId.value) || groups.value[0] || null)

// 登記清單一變（元件掛載 / 卸載）就確保選中的還在
watch(groups, (list) => {
  if (!list.some(g => g.id === activeId.value)) activeId.value = list[0]?.id ?? null
}, { immediate: true })

const fields = computed(() => particleToolFields(active.value?.fields))

// --- 草稿 -------------------------------------------------------------------
// ⚠️ 每一組各存一份，切分頁不會把還沒保存的改動洗掉。
const drafts = reactive({})
// 上次按了哪個檔位預設，也是每組各記一份
const presetOf = reactive({})

function seed (group) {
  if (!group) return
  const d = drafts[group.id] || (drafts[group.id] = {})
  for (const k of group.fields) {
    if (Number.isFinite(group.knobs?.[k])) d[k] = group.knobs[k]
  }
}

// 引擎那邊的值一變（建好、換效果、檔位被量測器降下來）就重新灌進草稿。
// ⚠️ deep 是必要的：knobs 是同一個 reactive 物件，逐欄改不會觸發淺層 watch。
watch(groups, list => list.forEach(seed), { immediate: true, deep: true })

const draft = computed(() => (active.value ? drafts[active.value.id] || {} : {}))

function dirtyOf (group) {
  const d = drafts[group?.id]
  if (!group || !d) return false

  return group.fields.some(k => Number.isFinite(d[k]) && Number(d[k]) !== group.knobs?.[k])
}

const dirty = computed(() => groups.value.some(dirtyOf))

// 按 t0~t3：只灌草稿，不套用。灌完可以再逐項微調，按保存才生效。
function loadPreset (p) {
  const g = active.value
  if (!g || !p) return
  presetOf[g.id] = p.tier
  const d = drafts[g.id] || (drafts[g.id] = {})
  for (const k of g.fields) {
    if (Number.isFinite(p.values?.[k])) d[k] = p.values[k]
  }
}

// ⚠️ 一次把「所有有改動的組」都套用，不是只套當前分頁 —— 在人像那頁改完切到
// 滿版場再改，按一次保存兩邊都要生效，否則會以為改掉的東西不見了。
async function apply () {
  for (const g of groups.value) {
    if (!dirtyOf(g)) continue
    const d = drafts[g.id]
    const out = {}
    for (const f of particleToolFields(g.fields)) {
      const n = Number(d[f.key])
      if (Number.isFinite(n)) out[f.key] = Math.max(f.min, Math.min(f.max, n))
    }
    await g.apply?.(out)
  }
}

function reset () {
  for (const g of groups.value) {
    presetOf[g.id] = null
    seed(g)
  }
}
</script>

<template>
  <Teleport to="body">
    <!-- 收起來的樣子：右下角一顆按鈕。
         ⚠️ 不要只把上面那條標題列留著當開關 —— 那是 17rem 寬的橫條，在手機上
         會壓住半個畫面底部，而且看起來像壞掉的殘留物而不是「可以點開」。
         44px 是 iOS 的最小觸控目標，別再縮小。 -->
    <button
      v-if="!open"
      type="button"
      class="fixed bottom-3 right-3 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/85 text-[#efe6d2] backdrop-blur-md transition-colors hover:bg-white/10"
      aria-label="打開粒子場工具面板"
      :aria-expanded="false"
      @click="toggle"
    >
      <svg
        viewBox="0 0 24 24"
        class="h-[1.15rem] w-[1.15rem]"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
        <circle
          cx="16"
          cy="7"
          r="2"
        />
        <circle
          cx="10"
          cy="17"
          r="2"
        />
      </svg>
      <!-- 有還沒保存的改動就標一點，不然收起來之後會忘記自己改到一半 -->
      <span
        v-if="dirty"
        class="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#efe6d2]"
      />
    </button>

    <aside
      v-else
      class="fixed bottom-3 right-3 z-50 flex max-h-[calc(100vh-1.5rem)] w-[17rem] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-white/15 bg-black/85 text-[#efe6d2] backdrop-blur-md"
      aria-label="粒子場工具面板"
    >
      <!-- 標題列兼收合開關 -->
      <button
        type="button"
        class="flex w-full shrink-0 items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-white/10"
        :aria-expanded="true"
        @click="toggle"
      >
        <span class="font-mono text-fs-micro uppercase text-white/45">Particle Tool</span>
        <span class="ml-auto truncate font-mono text-fs-micro text-white/45">
          <template v-if="look">{{ pinned ? look.index : '↻' }}</template>
          <template v-if="active"> · {{ (active.knobs.count || 0).toLocaleString() }}</template>
        </span>
        <span class="shrink-0 font-mono text-fs-micro text-white/60">▾</span>
      </button>

      <!-- ⚠️ min-h-0 是必要的：flex 子項預設 min-height:auto，少了它內層的
           overflow-y-auto 不會生效，整塊會被內容撐爆而不是捲動。 -->
      <div data-lenis-prevent class="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <template v-if="look">
          <p class="px-1 font-mono text-fs-micro uppercase text-white/45">
            Hero Animation
          </p>

          <ul class="mt-2 space-y-1">
            <li>
              <button
                type="button"
                class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/10"
                :class="!pinned ? 'bg-white/15' : ''"
                :disabled="switching"
                @click="emit('pick', null)"
              >
                <span class="w-3 font-mono text-fs-micro text-white/40">↻</span>
                <span class="text-fs-body-sm">隨機</span>
                <span
                  v-if="!pinned"
                  class="ml-auto font-mono text-fs-micro text-white/45"
                >{{ look.index }}</span>
              </button>
            </li>

            <li
              v-for="item in looks"
              :key="item.id"
            >
              <button
                type="button"
                class="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/10"
                :class="pinned && look.id === item.id ? 'bg-white/15' : ''"
                :disabled="switching"
                @click="emit('pick', item.index)"
              >
                <span class="mt-0.5 w-3 font-mono text-fs-micro text-white/40">{{ item.index }}</span>
                <span class="min-w-0">
                  <span class="block truncate text-fs-body-sm">{{ item.name }}</span>
                  <span class="block font-mono text-fs-micro text-white/35">
                    {{ item.rules.preset }} · {{ item.rules.seedPattern }}
                  </span>
                </span>
              </button>
            </li>
          </ul>

          <!-- 維持開場構圖的力度。0 = 完全放手，100 = 照該組設定，200 = 近乎鎖死。
               ⚠️ 這個刻意不走草稿 —— 它只改一個裸變數、下一幀就生效、沒有成本，
               即時拖曳才看得出差別。 -->
          <div class="mt-3 border-t border-white/10 px-1 pt-3">
            <label class="flex items-baseline justify-between font-mono text-fs-micro uppercase text-white/45">
              <span>維持開場構圖</span>
              <span class="text-white/70">{{ holdPct }}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              :value="holdPct"
              class="mt-2 w-full accent-white/80"
              @input="emit('hold', Number($event.target.value))"
            >
            <p class="mt-1 font-mono text-fs-micro leading-relaxed text-white/30">
              grip {{ Math.round(look.hold.grip * holdPct / 100) }}
            </p>
          </div>
        </template>

        <template v-if="active">
          <!-- 兩組以上才長分頁（窄視窗：滿版場 + 人像）。 -->
          <div
            v-if="groups.length > 1"
            class="mt-3 flex gap-1 border-t border-white/10 pt-3"
          >
            <button
              v-for="g in groups"
              :key="g.id"
              type="button"
              class="flex-1 truncate rounded-lg border px-2 py-1 font-mono text-fs-micro transition-colors hover:bg-white/10"
              :class="g.id === active.id ? 'border-white/40 bg-white/15' : 'border-white/15'"
              @click="activeId = g.id"
            >
              {{ g.label }}<span v-if="dirtyOf(g)"> ·</span>
            </button>
          </div>

          <!-- 檔位：一鍵把一組合理起點載進下面的欄位，不直接套用。 -->
          <div
            v-if="active.presets && active.presets.length"
            class="mt-3 border-t border-white/10 px-1 pt-3"
          >
            <p class="flex items-baseline justify-between font-mono text-fs-micro uppercase text-white/45">
              <span>清晰度檔位</span>
              <span class="text-white/30">載入預設</span>
            </p>
            <div class="mt-2 flex gap-1">
              <button
                v-for="p in active.presets"
                :key="p.tier"
                type="button"
                class="flex-1 rounded-lg border px-0 py-1 font-mono text-fs-micro transition-colors hover:bg-white/10 disabled:opacity-30"
                :class="presetOf[active.id] === p.tier ? 'border-white/40 bg-white/15' : 'border-white/15'"
                :disabled="switching"
                @click="loadPreset(p)"
              >
                t{{ p.tier }}
              </button>
            </div>
            <p class="mt-1 font-mono text-fs-micro leading-relaxed text-white/30">
              只填進下面的欄位，按保存才生效。t3 = 目前線上的值。
            </p>
          </div>

          <!-- 逐項微調 -->
          <div class="mt-3 border-t border-white/10 px-1 pt-3">
            <p class="font-mono text-fs-micro uppercase text-white/45">
              參數微調
            </p>
            <div
              v-for="f in fields"
              :key="f.key"
              class="mt-2 flex items-center gap-2"
            >
              <label
                :for="'wc-knob-' + active.id + '-' + f.key"
                class="min-w-0 flex-1 truncate text-fs-body-sm text-white/70"
              >{{ f.label }}</label>
              <span
                v-if="active.knobs[f.key] !== Number(draft[f.key])"
                class="shrink-0 font-mono text-fs-micro text-white/30 line-through"
              >{{ active.knobs[f.key] }}</span>
              <input
                :id="'wc-knob-' + active.id + '-' + f.key"
                v-model.number="drafts[active.id][f.key]"
                type="number"
                :min="f.min"
                :max="f.max"
                :step="f.step"
                class="w-[5.5rem] shrink-0 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-right font-mono text-fs-body-sm tabular-nums text-white/85 outline-none focus:border-white/40"
                @keyup.enter="apply"
              >
            </div>
            <p
              v-if="active.meta"
              class="mt-2 font-mono text-fs-micro leading-relaxed text-white/30"
            >
              <template v-if="active.meta.autoCount">依面積算出來是 {{ active.meta.autoCount.toLocaleString() }} 顆</template>
              <template v-if="active.meta.backend"> · {{ active.meta.backend }}</template>
              <template v-if="active.meta.note"><br>{{ active.meta.note }}</template>
            </p>
          </div>

          <!-- 白話說明。預設收著，免得把旋鈕擠到看不見。 -->
          <div class="mt-3 border-t border-white/10 px-1 pt-3">
            <button
              type="button"
              class="flex w-full items-center gap-2 text-left font-mono text-fs-micro uppercase text-white/45 transition-colors hover:text-white/70"
              :aria-expanded="helpOpen"
              @click="toggleHelp"
            >
              <span>這些數值是什麼</span>
              <span
                class="ml-auto transition-transform"
                :class="helpOpen ? '' : 'rotate-180'"
              >▾</span>
            </button>
            <dl
              v-if="helpOpen"
              class="mt-2 space-y-2.5"
            >
              <div
                v-for="f in fields"
                :key="f.key"
              >
                <dt class="text-fs-body-sm text-white/70">
                  {{ f.label }}
                </dt>
                <dd class="mt-0.5 text-fs-micro leading-relaxed text-white/40">
                  {{ f.help }}
                </dd>
              </div>
            </dl>
          </div>
        </template>
      </div>

      <!-- 保存列。⚠️ 放在捲動區「外面」，所以永遠貼在面板底部。 -->
      <div
        v-if="active"
        class="flex shrink-0 gap-1.5 border-t border-white/15 bg-black/60 px-3 py-2"
      >
        <button
          type="button"
          class="flex-1 rounded-lg border px-2 py-1.5 font-mono text-fs-micro transition-colors disabled:opacity-30"
          :class="dirty ? 'border-white/40 bg-white/15 hover:bg-white/25' : 'border-white/15'"
          :disabled="!dirty || switching"
          @click="apply"
        >
          {{ switching ? '套用中…' : '保存並套用' }}
        </button>
        <button
          type="button"
          class="shrink-0 rounded-lg border border-white/15 px-2 py-1.5 font-mono text-fs-micro transition-colors hover:bg-white/10 disabled:opacity-30"
          :disabled="!dirty || switching"
          @click="reset"
        >
          還原
        </button>
      </div>
    </aside>
  </Teleport>
</template>

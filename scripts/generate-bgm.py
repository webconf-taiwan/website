"""
WebConf 2026 背景音試聽稿產生器（純 numpy 合成，不用任何素材 / 授權音檔）

    python3 scripts/generate-bgm.py
    → public/audio/lab/*.m4a（AAC 128k，透過 macOS 內建的 afconvert 轉檔）

v2 方向：科技感。第一版（暖 pad、大調五聲琶音、鐘音）被回饋「不夠科技、loading 像
刀劍神域的開場」—— 大調和弦＋上行五聲＋鐘音就是遊戲 UI／變身音效的語彙。
這一版刻意全部拿掉：沒有大三和弦、沒有鐘音、沒有五聲音階，改用
數據 blip、噪音掃頻、時脈 tick、脈衝波音序、四五度（不含三度）的冷色和聲、非諧波金屬音。

產出：
  intro.m4a         loading，約 7 秒單次播放 —— 系統開機／鎖定：
                      0.0  低頻 thump（對齊圓圈從中心放大）
                      1.0~4.6  資料 blip 越來越密＋噪音由低往高掃＋時脈 tick 加速（藍線在畫）
                      4.6  「鎖定」：低頻下潛＋短促的數位 chirp＋反向噪音收束 → 金屬共鳴尾音
  ambient-a.m4a     A · Data Stream：深色脈動 drone（四五度、無三度）＋側鏈呼吸＋零散資料 blip
  ambient-b.m4a     B · Circuit：濾過的脈衝波音序琶音＋低音線＋時脈 tick，濾波器緩慢開合
  ambient-c.m4a     C · Signal：稀疏的 modem 式 chirp、聲納 ping（非諧波）、低頻電源 hum、無線電雜訊

背景音都是 120 BPM、60 秒 = 30 小節，無縫循環。

正式使用（public/audio/，網站 loading 真的會播的兩段）：
  intro-build.m4a   開機 thump → 藍線在畫的那段（blip、掃頻、時脈 tick）。
                    4.6s 之後是一段 1.9s 的「高原」，可以無縫循環（Web Audio 的 loopStart /
                    loopEnd）—— loading 等資源等比較久時就停在這裡循環，不會播完變安靜。
  intro-lock.m4a    圓圈真的畫滿那一刻才播的「鎖定」：低頻下潛＋數位 chirp＋金屬共鳴。
  拆兩段的理由：loading 的長度不固定（慢網路要等資源），單一音檔的鎖定點對不上圓圈畫滿。
  背景音本身不用音檔，是 app/utils/soundEngine.js 用 Web Audio 即時生成（A 版的配方）。

⚠️ 這是「試聽稿」，只在 /sound-lab 頁試聽用；定案後再決定要不要改成 Web Audio 即時合成。

無縫循環的做法（三件事缺一不可，少一件循環點就會「咚」一聲或斷一截）：
  1. 乾聲畫在剛好 L 秒的「環狀」buffer 上：跨過結尾的聲音繞回開頭（place_wrap）
  2. 持續音的頻率量化成「L 秒內剛好整數個週期」（loop_freq），循環點波形相位連續
  3. 殘響尾巴疊回開頭（fold）＝ 環狀卷積，循環點前後的空間感也連續
"""
import os
import subprocess
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio', 'lab')
rng = np.random.default_rng(2026)

BPM = 120
BEAT = 60 / BPM          # 0.5s
STEP = BEAT / 4          # 16 分音符 0.125s


# ---------------------------------------------------------------- 基本元件 ----

def t_axis(sec):
    return np.arange(int(round(sec * SR))) / SR


def note(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def loop_freq(f, L):
    """頻率量化成 L 秒內整數個週期（循環點相位連續）"""
    return max(1, round(f * L)) / L


def pulse(f, t, duty=0.3, bright=1.0, n_harm=30):
    """頻帶限制的脈衝波（加法合成）。bright 可以是陣列 → 等同濾波器開合"""
    out = np.zeros_like(t)
    for k in range(1, n_harm + 1):
        if f * k > SR / 2 - 800:
            break
        amp = np.sin(np.pi * k * duty) / k * np.power(np.clip(bright, 1e-4, 1.0), (k - 1) * 0.5)
        out += amp * np.cos(2 * np.pi * f * k * t)
    return out


def saw(f, t, bright=1.0, n_harm=16):
    out = np.zeros_like(t)
    for k in range(1, n_harm + 1):
        if f * k > SR / 2 - 800:
            break
        out += (1 / k) * np.power(np.clip(bright, 1e-4, 1.0), (k - 1) * 0.55) * np.sin(2 * np.pi * f * k * t)
    return out


def exp_env(n, attack, decay_rate):
    t = np.arange(n) / SR
    env = np.exp(-t * decay_rate)
    na = max(1, int(attack * SR))
    env[:na] *= np.linspace(0, 1, na)
    return env


def blip(f, sec=0.03, square=True):
    """資料 blip：極短的方波／正弦顆粒"""
    t = t_axis(sec)
    w = np.sign(np.sin(2 * np.pi * f * t)) * 0.6 if square else np.sin(2 * np.pi * f * t)
    return w * exp_env(len(t), 0.001, 60 / sec * 0.08)


def tick(sec=0.02, f=5200):
    t = t_axis(sec)
    return (np.sin(2 * np.pi * f * t) + rng.standard_normal(len(t)) * 0.4) * np.exp(-t * 320)


def chirp(f0, f1, sec, curve=2.0):
    t = t_axis(sec)
    u = t / sec
    f = f0 + (f1 - f0) * u ** curve
    phase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(phase) * np.sin(np.pi * u) ** 0.5


def ping(f, sec=2.5):
    """聲納 ping：非諧波泛音（金屬感），不是鐘音那種和諧的 FM"""
    t = t_axis(sec)
    out = np.zeros_like(t)
    for ratio, amp, dec in [(1.0, 1.0, 1.6), (2.76, 0.45, 3.2), (5.40, 0.22, 5.0), (8.93, 0.1, 8.0)]:
        out += amp * np.exp(-t * dec) * np.sin(2 * np.pi * f * ratio * t)
    return out * exp_env(len(t), 0.002, 0)


def thump(f0=90, f1=38, sec=0.9):
    t = t_axis(sec)
    f = f1 + (f0 - f1) * np.exp(-t * 18)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4.5)


def bandnoise(n, center, width_oct=0.6):
    spec = np.fft.rfft(rng.standard_normal(n))
    freqs = np.fft.rfftfreq(n, 1 / SR)
    lf = np.log2(np.maximum(freqs, 1))
    mask = np.exp(-((lf - np.log2(center)) ** 2) / (2 * width_oct ** 2))
    out = np.fft.irfft(spec * mask, n)
    return out / (np.max(np.abs(out)) + 1e-9)


def sweep_noise(sec, f_from, f_to, width_oct=0.5, curve=1.0):
    """帶通噪音由 f_from 掃到 f_to：切成 40ms 小段各自濾波、Hann 窗重疊相加"""
    n = int(sec * SR)
    hop = int(0.02 * SR)
    win = np.hanning(hop * 2)
    out = np.zeros(n + hop * 2)
    for i in range(0, n, hop):
        u = (i / n) ** curve
        c = f_from * (f_to / f_from) ** u
        out[i:i + hop * 2] += bandnoise(hop * 2, c, width_oct) * win
    return out[:n] / (np.max(np.abs(out)) + 1e-9)


def crush(x, bits=6, hold=4):
    """位元壓縮＋降取樣（sample & hold）：數位的粗糙感"""
    q = 2 ** (bits - 1)
    y = np.round(x * q) / q
    idx = (np.arange(len(y)) // hold) * hold
    return y[idx]


def reverb(x, sec=3.0, mix=0.3, pre=0.015, damp=6000):
    """衰減白噪音當 IR 的卷積殘響（左右各一條 IR → 立體寬度）"""
    n_ir = int(sec * SR)
    t = np.arange(n_ir) / SR
    out = np.zeros((len(x) + n_ir, 2))
    size = 1 << int(np.ceil(np.log2(len(x) + n_ir)))
    for ch in range(2):
        ir = rng.standard_normal(n_ir) * np.exp(-t * 6.9 / sec)
        ir[: int(pre * SR)] = 0
        spec = np.fft.rfft(ir)
        freqs = np.fft.rfftfreq(n_ir, 1 / SR)
        ir = np.fft.irfft(spec / (1 + (freqs / damp) ** 2), n_ir)
        ir /= np.sqrt(np.sum(ir ** 2))
        out[:, ch] = np.fft.irfft(np.fft.rfft(x[:, ch], size) * np.fft.rfft(ir, size), size)[: len(x) + n_ir]
    dry = np.zeros_like(out)
    dry[: len(x)] = x
    return dry * (1 - mix) + out * mix


def stereo(mono, pan=0.0):
    return np.stack([mono * np.cos((pan + 1) * np.pi / 4), mono * np.sin((pan + 1) * np.pi / 4)], axis=1)


def place(buf, clip, at):
    i = int(round(at * SR))
    if i >= len(buf):
        return
    j = min(len(buf), i + len(clip))
    buf[i:j] += clip[: j - i]


def place_wrap(buf, clip, at):
    """環狀 buffer：超過結尾的部分繞回開頭"""
    n = len(buf)
    i = int(round(at * SR)) % n
    first = min(len(clip), n - i)
    buf[i:i + first] += clip[:first]
    rest = clip[first:]
    while len(rest):
        k = min(n, len(rest))
        buf[:k] += rest[:k]
        rest = rest[k:]


def fold(x, length):
    """殘響算完後，把 length 之後的尾巴疊回開頭（＝環狀卷積）"""
    n = int(length * SR)
    out = x[:n].copy()
    tail = x[n:]
    while len(tail):
        k = min(n, len(tail))
        out[:k] += tail[:k]
        tail = tail[k:]
    return out


def sidechain(t, depth=0.55, rate=7.0, attack=0.008):
    """每拍一次的「側鏈」下壓：拍點在 attack 秒內壓下去、再慢慢回來。
    ⚠️ 一定要有 attack：瞬間掉下去 = 每拍一個增益階梯 = 每拍一聲「喀」（循環點也是）"""
    phase = (t % BEAT)
    shape = np.where(phase < attack, phase / attack, np.exp(-(phase - attack) * rate))
    return 1 - depth * shape


def master(x, peak_db=-3.0):
    x = x - x.mean(axis=0)
    x = np.tanh(x / (np.max(np.abs(x)) + 1e-9) * 1.3)
    return x / np.max(np.abs(x)) * 10 ** (peak_db / 20)


def write(name, x, out=OUT):
    os.makedirs(out, exist_ok=True)
    wav = os.path.join(out, name + '.wav')
    m4a = os.path.join(out, name + '.m4a')
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '128000', wav, m4a], check=True)
    keep = os.environ.get('BGM_KEEP_WAV')  # 驗證接縫用：AAC 解碼回來頭尾有 padding，量不準
    if keep:
        os.replace(wav, os.path.join(keep, name + '.wav'))
    else:
        os.remove(wav)
    print(f'{name}.m4a  {len(x) / SR:.1f}s  {os.path.getsize(m4a) // 1024}KB')


# ----------------------------------------------------------------- loading ----
# 時間軸對齊 Intro.vue：0~0.8 圓圈放大、~1.0 起文字解碼＋藍線畫圈、~4.6 畫滿 → 微縮淡出

def make_intro():
    sec = 8.0
    n = int(sec * SR)
    buf = np.zeros((n, 2))
    draw0, lock = 1.0, 4.6

    # 1. 開機 thump（圓圈從中心放大）＋一小段低頻嗡鳴
    place(buf, stereo(thump(110, 42, 1.2) * 0.9), 0.0)
    hum_t = t_axis(lock)
    hum = (np.sin(2 * np.pi * 55 * hum_t) * 0.5 + np.sin(2 * np.pi * 110 * hum_t) * 0.15)
    hum *= np.clip(hum_t / 0.8, 0, 1) * (0.25 + 0.35 * np.clip((hum_t - draw0) / (lock - draw0), 0, 1))
    place(buf, stereo(hum * 0.35), 0.0)

    # 2. 噪音掃頻：藍線在畫的時候由低往高掃，越來越亮
    sw = sweep_noise(lock - draw0, 180, 7000, 0.45, 1.4)
    su = np.linspace(0, 1, len(sw))
    sw *= (0.15 + 0.85 * su ** 2) * 0.22
    place(buf, np.stack([sw, np.roll(sw, 300)], axis=1), draw0)

    # 3. 資料 blip：密度隨進度增加，音高隨機散在 1.2~6kHz
    at = draw0
    while at < lock:
        u = (at - draw0) / (lock - draw0)
        f = rng.choice([1200, 1600, 2400, 3200, 4800, 6000]) * rng.uniform(0.98, 1.02)
        g = blip(f, rng.uniform(0.012, 0.035), square=rng.random() < 0.6)
        place(buf, stereo(crush(g, 7, 3) * (0.05 + 0.07 * u), rng.uniform(-0.9, 0.9)), at)
        at += rng.uniform(0.02, 0.09) * (1.6 - u * 1.3)

    # 4. 時脈 tick：從四分音符加速到 32 分音符
    at, gap = draw0, 0.5
    while at < lock - 0.02:
        place(buf, stereo(tick(0.018, 5200) * 0.12, 0), at)
        at += gap
        gap = max(0.045, gap * 0.86)

    # 5. 鎖定（圓圈畫滿）：反向噪音收束 → 低頻下潛＋數位 chirp → 金屬共鳴尾音
    rev = bandnoise(int(0.35 * SR), 5000, 1.2)[::-1] * np.linspace(0, 1, int(0.35 * SR)) ** 3
    place(buf, stereo(rev * 0.35), lock - 0.35)
    place(buf, stereo(thump(160, 34, 1.6) * 1.0), lock)
    place(buf, stereo(chirp(2400, 380, 0.16, 0.6) * 0.14, -0.3), lock)
    place(buf, stereo(chirp(900, 5200, 0.12, 2.0) * 0.07, 0.35), lock + 0.05)
    place(buf, stereo(ping(note(57), 3.2) * 0.1, 0.1), lock + 0.02)   # A3，非諧波泛音 → 金屬感而非鐘聲

    wet = reverb(buf, 2.6, 0.28)[: int(sec * SR)]
    wet[-int(1.2 * SR):] *= np.linspace(1, 0, int(1.2 * SR))[:, None] ** 2
    write('intro', master(wet, -3.5))


# ----------------------------------------------------------- A · Data Stream --

def make_ambient_a():
    L = 60.0
    t = t_axis(L)
    buf = np.zeros((len(t), 2))

    # 深色 drone：D1/D2/A2/G2（四五度，沒有三度），脈衝波，濾波器 16 秒一個週期緩慢開合
    cutoff = 0.12 + 0.1 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 15))
    duck = sidechain(t, 0.5, 6.0)
    for m, vol, duty, pan in [(26, 0.16, 0.5, 0), (38, 0.2, 0.25, -0.3), (45, 0.14, 0.3, 0.3), (43, 0.09, 0.2, -0.5)]:
        buf += stereo(pulse(loop_freq(note(m), L), t, duty, cutoff, 24) * vol * duck, pan)

    # 高頻 hiss，跟著側鏈一起呼吸
    hiss = bandnoise(len(t), 8000, 0.8)
    buf += np.stack([hiss, np.roll(hiss, SR // 5)], axis=1) * 0.05 * duck[:, None]

    # 資料 blip：成串出現（一串 4~12 顆，16 分音符格線上）
    bar = 0
    while bar < 30:
        if rng.random() < 0.55:
            start = bar * 4 * BEAT + rng.integers(0, 16) * STEP
            count = rng.integers(4, 13)
            base = rng.choice([1600, 2400, 3200, 4800])
            pan = rng.uniform(-0.8, 0.8)
            for k in range(count):
                f = base * rng.choice([1, 1.5, 2, 0.75])
                place_wrap(buf, stereo(crush(blip(f, 0.022), 6, 4) * 0.14, pan), start + k * STEP / 2)
        bar += 1

    wet = reverb(buf, 3.5, 0.3)
    write('ambient-a', master(fold(wet, L), -6.0))


# ------------------------------------------------------------ B · Circuit -----

def make_ambient_b():
    L = 60.0
    t = t_axis(L)
    buf = np.zeros((len(t), 2))

    # 低音線：每小節換一次，D - D - C - A（整段 30 小節 → 循環點剛好回到 D）
    bass_seq = [26, 26, 24, 21]
    for bar in range(30):
        m = bass_seq[bar % 4]
        for beat in range(4):
            if beat in (0, 2) or rng.random() < 0.25:
                seg = t_axis(BEAT * 0.9)
                env = exp_env(len(seg), 0.004, 5)
                place_wrap(buf, stereo(pulse(note(m + 12), seg, 0.45, 0.18, 20) * env * 0.3), (bar * 4 + beat) * BEAT)

    # 脈衝波音序琶音：16 分音符，Dm(add9, 無三度)／四度堆疊，濾波器 20 秒開合一次
    arp = [62, 69, 74, 76, 69, 74, 79, 81, 64, 69, 76, 74, 67, 74, 79, 72]
    steps = int(L / STEP)
    for s in range(steps):
        m = arp[s % len(arp)] + (-12 if (s // 64) % 2 else 0)
        at = s * STEP
        bright = 0.08 + 0.35 * (0.5 + 0.5 * np.sin(2 * np.pi * at / 20 - np.pi / 2))
        seg = t_axis(STEP * 1.6)
        env = exp_env(len(seg), 0.002, 18)
        accent = 1.0 if s % 4 == 0 else 0.6
        pan = 0.45 * np.sin(2 * np.pi * s / 32)
        place_wrap(buf, stereo(pulse(note(m), seg, 0.25, bright, 28) * env * 0.075 * accent, pan), at)

    # 時脈 tick：8 分音符的 hi-hat 式 tick，反拍略重
    for s in range(int(L / (BEAT / 2))):
        place_wrap(buf, stereo(tick(0.015, 7000) * (0.07 if s % 2 else 0.035), 0.2), s * BEAT / 2)

    wet = reverb(buf, 2.8, 0.25)
    write('ambient-b', master(fold(wet, L), -6.0))


# ------------------------------------------------------------ C · Signal ------

def make_ambient_c():
    L = 60.0
    t = t_axis(L)
    buf = np.zeros((len(t), 2))

    # 低頻電源 hum（60Hz 的基音＋奇次泛音），幾乎聽不到、只有存在感
    hum = sum(np.sin(2 * np.pi * loop_freq(60 * k, L) * t) / k ** 1.4 for k in (1, 3, 5, 7))
    buf += stereo(hum * 0.07 * (0.8 + 0.2 * np.sin(2 * np.pi * t / 30)))

    # 無線電雜訊：帶通噪音，強度像訊號時好時壞
    static = bandnoise(len(t), 2500, 1.4)
    fade = np.clip(np.sin(2 * np.pi * t / 12) * np.sin(2 * np.pi * t / 20 + 1), 0, 1) ** 2
    buf += np.stack([static, np.roll(static, SR // 7)], axis=1) * (0.01 + 0.035 * fade)[:, None]

    # 聲納 ping：非諧波，間隔 5~9 秒，帶一次短回聲
    at = 2.0
    while at < L:
        f = note(rng.choice([57, 62, 64, 69]))
        pan = rng.uniform(-0.6, 0.6)
        place_wrap(buf, stereo(ping(f, 3.0) * 0.12, pan), at)
        place_wrap(buf, stereo(ping(f, 2.0) * 0.04, -pan), at + 0.375)
        at += rng.uniform(5, 9)

    # modem 式 chirp：一小串上下掃頻＋位元壓縮
    at = 5.0
    while at < L:
        for k in range(rng.integers(3, 7)):
            f0, f1 = rng.choice([(1200, 2400), (2400, 1200), (1800, 3600), (3000, 900)])
            place_wrap(buf, stereo(crush(chirp(f0, f1, rng.uniform(0.05, 0.11)), 5, 3) * 0.035, rng.uniform(-0.7, 0.7)), at + k * 0.09)
        at += rng.uniform(6, 12)

    wet = reverb(buf, 4.5, 0.4)
    write('ambient-c', master(fold(wet, L), -6.0))


# ----------------------------------------------- 正式版 loading（拆兩段） ----

PROD = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')
BUILD_LOOP_START = 4.6   # ⚠️ 要跟 app/utils/soundEngine.js 的 INTRO_LOOP_START / END 一致
BUILD_LOOP_END = 6.5


def make_intro_parts():
    draw0, lock = 1.0, BUILD_LOOP_START
    plateau = BUILD_LOOP_END - BUILD_LOOP_START

    # --- build 前段（0 ~ 4.6s）：跟試聽版的 loading 一樣，但拿掉鎖定與反向收束 ---
    pre = np.zeros((int(lock * SR), 2))
    place(pre, stereo(thump(110, 42, 1.2) * 0.9), 0.0)
    hum_t = t_axis(lock)
    hum = (np.sin(2 * np.pi * 55 * hum_t) * 0.5 + np.sin(2 * np.pi * 110 * hum_t) * 0.15)
    hum *= np.clip(hum_t / 0.8, 0, 1) * (0.25 + 0.35 * np.clip((hum_t - draw0) / (lock - draw0), 0, 1))
    place(pre, stereo(hum * 0.35), 0.0)
    sw = sweep_noise(lock - draw0, 180, 7000, 0.45, 1.4)
    su = np.linspace(0, 1, len(sw))
    sw *= (0.15 + 0.85 * su ** 2) * 0.22
    place(pre, np.stack([sw, np.roll(sw, 300)], axis=1), draw0)
    at = draw0
    while at < lock:
        u = (at - draw0) / (lock - draw0)
        f = rng.choice([1200, 1600, 2400, 3200, 4800, 6000]) * rng.uniform(0.98, 1.02)
        place(pre, stereo(crush(blip(f, rng.uniform(0.012, 0.035), rng.random() < 0.6), 7, 3) * (0.05 + 0.07 * u), rng.uniform(-0.9, 0.9)), at)
        at += rng.uniform(0.02, 0.09) * (1.6 - u * 1.3)
    at, gap = draw0, 0.5
    while at < lock - 0.02:
        place(pre, stereo(tick(0.018, 5200) * 0.12, 0), at)
        at += gap
        gap = max(0.045, gap * 0.86)

    # --- build 高原（4.6 ~ 6.5s，環狀 → 可無縫循環）：維持前段結尾的密度與亮度 ---
    hi = np.zeros((int(plateau * SR), 2))
    pt = t_axis(plateau)
    hi += stereo((np.sin(2 * np.pi * loop_freq(55, plateau) * pt) * 0.5 + np.sin(2 * np.pi * loop_freq(110, plateau) * pt) * 0.15) * 0.6 * 0.35)
    band = bandnoise(len(pt), 7000, 0.45) * 0.22
    hi += np.stack([band, np.roll(band, 300)], axis=1)
    at = 0.0
    while at < plateau:
        f = rng.choice([1200, 1600, 2400, 3200, 4800, 6000]) * rng.uniform(0.98, 1.02)
        place_wrap(hi, stereo(crush(blip(f, rng.uniform(0.012, 0.035), rng.random() < 0.6), 7, 3) * 0.12, rng.uniform(-0.9, 0.9)), at)
        at += rng.uniform(0.02, 0.09) * 0.3
    for k in range(int(plateau / 0.0625)):
        place_wrap(hi, stereo(tick(0.018, 5200) * 0.12, 0), k * 0.0625)

    pre_wet = reverb(pre, 2.6, 0.28)
    hi_wet = fold(reverb(hi, 2.6, 0.28), plateau)
    build = np.vstack([pre_wet[: len(pre)], hi_wet])
    build[len(pre):len(pre) + int(2.6 * SR)] += pre_wet[len(pre):len(pre) + int(2.6 * SR)][: len(build) - len(pre)]
    # 前段與高原各自正規化會對不上音量，所以整段一起 master，只做同一個增益
    gain = 10 ** (-3.5 / 20) / (np.max(np.abs(build)) + 1e-9)
    write('intro-build', np.tanh(build * gain * 1.1) / 1.1, PROD)

    # --- lock：圓圈畫滿那一刻才播 ---
    sec = 3.6
    lk = np.zeros((int(sec * SR), 2))
    place(lk, stereo(bandnoise(int(0.08 * SR), 5000, 1.2) * np.linspace(1, 0, int(0.08 * SR)) ** 2 * 0.3), 0)
    place(lk, stereo(thump(160, 34, 1.6) * 1.0), 0)
    place(lk, stereo(chirp(2400, 380, 0.16, 0.6) * 0.14, -0.3), 0)
    place(lk, stereo(chirp(900, 5200, 0.12, 2.0) * 0.07, 0.35), 0.05)
    place(lk, stereo(ping(note(57), 3.2) * 0.1, 0.1), 0.02)
    lk_wet = reverb(lk, 2.6, 0.28)[: len(lk)]
    lk_wet[-int(1.0 * SR):] *= np.linspace(1, 0, int(1.0 * SR))[:, None] ** 2
    write('intro-lock', lk_wet * gain, PROD)


if __name__ == '__main__':
    # ⚠️ 順序會影響亂數序列：試聽版的四個先跑，產出才會跟定稿時聽到的一模一樣
    make_intro()
    make_ambient_a()
    make_ambient_b()
    make_ambient_c()
    make_intro_parts()

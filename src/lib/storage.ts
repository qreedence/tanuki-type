import type { KanaMode } from "@/lib/kana"
import type { GameType } from "@/lib/words"
import type { TimerDuration } from "@/hooks/useTimer"

type Settings = {
  gameType: GameType
  kanaMode: KanaMode
  duration: TimerDuration
  showHints: boolean
}

const STORAGE_KEY = "tanukitype-settings"

const DEFAULTS: Settings = {
  gameType: "kana",
  kanaMode: "hiragana",
  duration: 30,
  showHints: false,
}

const VALID_GAME_TYPES: GameType[] = ["kana", "words"]
const VALID_KANA_MODES: KanaMode[] = ["hiragana", "katakana", "mixed"]
const VALID_DURATIONS: TimerDuration[] = [0, 15, 30, 60, 120]

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw)
    return {
      gameType: VALID_GAME_TYPES.includes(parsed.gameType)
        ? parsed.gameType
        : DEFAULTS.gameType,
      kanaMode: VALID_KANA_MODES.includes(parsed.kanaMode)
        ? parsed.kanaMode
        : DEFAULTS.kanaMode,
      duration: VALID_DURATIONS.includes(parsed.duration)
        ? parsed.duration
        : DEFAULTS.duration,
      showHints:
        typeof parsed.showHints === "boolean"
          ? parsed.showHints
          : DEFAULTS.showHints,
    }
  } catch {
    return DEFAULTS
  }
}

export function saveSettings(settings: Partial<Settings>) {
  try {
    const current = loadSettings()
    const merged = { ...current, ...settings }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  } catch {
    // localStorage unavailable
  }
}

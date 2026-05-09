import { PillGroup } from "@/components/ui/pill-group"
import type { KanaMode } from "@/lib/kana"
import type { GameType } from "@/lib/words"
import type { TimerDuration } from "@/hooks/useTimer"

const KANA_MODES: { label: string; value: KanaMode }[] = [
  { label: "Hiragana", value: "hiragana" },
  { label: "Katakana", value: "katakana" },
  { label: "Mixed", value: "mixed" },
]

const TIMER_OPTIONS: { label: string; value: TimerDuration }[] = [
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
  { label: "120s", value: 120 },
  { label: "infinity", value: 0 },
]

export function ConfigBar({
  gameType,
  kanaMode,
  duration,
  showHints,
  onGameTypeChange,
  onModeChange,
  onDurationChange,
  onHintsToggle,
}: {
  gameType: GameType
  kanaMode: KanaMode
  duration: TimerDuration
  showHints: boolean
  onGameTypeChange: (type: GameType) => void
  onModeChange: (mode: KanaMode) => void
  onDurationChange: (dur: TimerDuration) => void
  onHintsToggle: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      <PillGroup
        options={[
          { label: "Kana", value: "kana" as GameType },
          { label: "Words", value: "words" as GameType },
        ]}
        value={gameType}
        onChange={onGameTypeChange}
      />
      <PillGroup
        options={KANA_MODES}
        value={kanaMode}
        onChange={onModeChange}
      />
      <PillGroup
        options={TIMER_OPTIONS.map((d) => ({
          label: d.label,
          value: String(d.value),
        }))}
        value={String(duration)}
        onChange={(v) => onDurationChange(Number(v) as TimerDuration)}
      />
      <button
        tabIndex={-1}
        onClick={onHintsToggle}
        className={`rounded-xl border px-3 py-1 text-sm font-medium transition-colors ${
          showHints
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border bg-secondary text-muted-foreground hover:text-foreground"
        }`}
      >
        Hints
      </button>
    </div>
  )
}

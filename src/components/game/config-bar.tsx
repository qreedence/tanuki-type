import { Infinity as InfinityIcon } from "lucide-react"
import AnimatedTabs from "@/components/ui/smoothui/animated-tabs"
import type { KanaMode } from "@/lib/kana"
import type { GameType } from "@/lib/words"
import type { TimerDuration } from "@/hooks/useTimer"

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
      <AnimatedTabs
        variant="pill"
        activeTab={gameType}
        onChange={(id) => onGameTypeChange(id as GameType)}
        tabs={[
          { id: "kana", label: "Kana" },
          { id: "words", label: "Words" },
        ]}
      />
      <AnimatedTabs
        variant="pill"
        activeTab={kanaMode}
        onChange={(id) => onModeChange(id as KanaMode)}
        tabs={[
          { id: "hiragana", label: "Hiragana" },
          { id: "katakana", label: "Katakana" },
          { id: "mixed", label: "Mixed" },
        ]}
      />
      <AnimatedTabs
        variant="pill"
        activeTab={String(duration)}
        onChange={(id) => onDurationChange(Number(id) as TimerDuration)}
        tabs={[
          { id: "30", label: "30s" },
          { id: "60", label: "60s" },
          { id: "120", label: "120s" },
          {
            id: "0",
            label: "",
            icon: <InfinityIcon className="size-4" />,
          },
        ]}
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

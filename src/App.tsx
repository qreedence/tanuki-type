import { useState, useRef, useLayoutEffect } from "react"
import { Button } from "@/components/ui/button"
import { useTypingEngine, type GamePhase } from "@/hooks/useTypingEngine"
import type { KanaMode } from "@/lib/kana"
import type { TimerDuration } from "@/hooks/useTimer"

const KANA_MODES: { label: string; value: KanaMode }[] = [
  { label: "Hiragana", value: "hiragana" },
  { label: "Katakana", value: "katakana" },
  { label: "Mixed", value: "mixed" },
]

const TIMER_DURATIONS: TimerDuration[] = [30, 60, 120]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export function App() {
  const [kanaMode, setKanaMode] = useState<KanaMode>("hiragana")
  const [duration, setDuration] = useState<TimerDuration>(30)

  const engine = useTypingEngine(kanaMode, duration)

  function handleModeChange(mode: KanaMode) {
    setKanaMode(mode)
    engine.reset(mode)
  }

  function handleDurationChange(dur: TimerDuration) {
    setDuration(dur)
    engine.reset()
  }

  const showConfig = engine.phase === "idle"

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/tanuki-type-logo.svg"
            alt="TanukiType logo"
            className="h-12 w-12"
          />
          <span className="text-3xl font-bold text-primary">TanukiType</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            Guest
          </Button>
        </div>
      </header>

      {/* Main area */}
      <main className="flex flex-1 flex-col items-center justify-center gap-12 px-8">
        {engine.phase === "finished" ? (
          <ResultsScreen
            wpm={engine.wpm}
            accuracy={engine.accuracy}
            errors={engine.errors}
            correctChars={engine.correctChars}
          />
        ) : (
          <>
            {/* Mode selectors — hidden while typing */}
            <div
              className={`flex flex-col items-center gap-3 transition-opacity duration-200 ${showConfig ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <div className="flex gap-1 rounded-xl border border-border bg-secondary p-1">
                {KANA_MODES.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => handleModeChange(m.value)}
                    className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                      kanaMode === m.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 rounded-xl border border-border bg-secondary p-1">
                {TIMER_DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => handleDurationChange(d)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                      duration === d
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            {/* Kana display */}
            <KanaDisplay
              sequence={engine.sequence}
              charStates={engine.charStates}
              currentIndex={engine.currentIndex}
              inputBuffer={engine.inputBuffer}
            />

            {/* Stats bar */}
            <StatsBar
              wpm={engine.wpm}
              accuracy={engine.accuracy}
              errors={engine.errors}
              timeLeft={engine.timeLeft}
              phase={engine.phase}
            />
          </>
        )}
      </main>

      {/* Hotkey bar */}
      <footer className="flex items-center justify-center gap-8 px-8 py-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono">
            Tab
          </kbd>
          <span>Restart</span>
        </div>
      </footer>
    </div>
  )
}

function getFillPercent(buffer: string, romaji: string[]): number {
  if (!buffer) return 0
  const matching = romaji.filter((r) => r.startsWith(buffer))
  if (matching.length === 0) return 0
  const shortest = Math.min(...matching.map((r) => r.length))
  return buffer.length / shortest
}

function KanaDisplay({
  sequence,
  charStates,
  currentIndex,
  inputBuffer,
}: {
  sequence: { kana: string; romaji: string[] }[]
  charStates: ("correct" | "current" | "pending" | "error")[]
  currentIndex: number
  inputBuffer: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const currentKanaRef = useRef<HTMLSpanElement>(null)
  const [cursorStyle, setCursorStyle] = useState({ left: 0, top: 0, height: 0 })

  const visibleStart = Math.max(0, currentIndex - 10)
  const visibleEnd = Math.min(sequence.length, currentIndex + 40)
  const visible = sequence.slice(visibleStart, visibleEnd)

  const currentEntry = sequence[currentIndex]
  const fillPercent = currentEntry
    ? getFillPercent(inputBuffer, currentEntry.romaji)
    : 0

  useLayoutEffect(() => {
    if (!currentKanaRef.current || !containerRef.current) return
    const container = containerRef.current.getBoundingClientRect()
    const kana = currentKanaRef.current.getBoundingClientRect()
    setCursorStyle({
      left: kana.left - container.left + kana.width * fillPercent,
      top: kana.top - container.top + 4,
      height: kana.height - 8,
    })
  }, [currentIndex, fillPercent])

  return (
    <div
      ref={containerRef}
      className="relative max-w-4xl select-none text-center font-kana text-3xl leading-relaxed"
    >
      {/* Smooth animated cursor */}
      <div
        className="pointer-events-none absolute w-0.5 animate-pulse bg-kana-cursor transition-[left,top] duration-150 ease-out"
        style={{
          left: cursorStyle.left,
          top: cursorStyle.top,
          height: cursorStyle.height,
        }}
      />

      {visible.map((entry, i) => {
        const absIndex = visibleStart + i
        const state = charStates[absIndex]!
        const isCurrent = absIndex === currentIndex
        const fill = isCurrent ? fillPercent : 0

        let colorClass: string
        let gradientStyle: React.CSSProperties | undefined
        switch (state) {
          case "correct":
            colorClass = "text-kana-correct"
            break
          case "error":
            colorClass = "text-kana-incorrect"
            break
          case "current":
            if (fill > 0) {
              colorClass = ""
              const pct = `${fill * 100}%`
              gradientStyle = {
                backgroundImage: `linear-gradient(to right, var(--kana-correct) ${pct}, var(--color-foreground) ${pct})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }
            } else {
              colorClass = "text-foreground"
            }
            break
          case "pending":
            colorClass = "text-kana-pending"
            break
        }

        return (
          <span
            key={absIndex}
            ref={isCurrent ? currentKanaRef : undefined}
            className={`mx-[0.15em] inline-block ${colorClass} transition-colors duration-150`}
            style={gradientStyle}
          >
            {entry.kana}
          </span>
        )
      })}
    </div>
  )
}

function StatsBar({
  wpm,
  accuracy,
  errors,
  timeLeft,
  phase,
}: {
  wpm: number
  accuracy: number
  errors: number
  timeLeft: number
  phase: GamePhase
}) {
  return (
    <div className="flex items-center gap-8 text-sm">
      <StatItem label="WPM" value={String(wpm)} className="text-primary" />
      <div className="h-8 w-px bg-border" />
      <StatItem
        label="Accuracy"
        value={`${accuracy}%`}
        className="text-primary"
      />
      <div className="h-8 w-px bg-border" />
      <StatItem
        label="Errors"
        value={String(errors)}
        className="text-destructive"
      />
      <div className="h-8 w-px bg-border" />
      <StatItem
        label={phase === "idle" ? "Duration" : "Time Left"}
        value={formatTime(timeLeft)}
        className="text-foreground"
      />
    </div>
  )
}

function StatItem({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className: string
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={`text-2xl font-bold tabular-nums ${className}`}>
        {value}
      </span>
    </div>
  )
}

function ResultsScreen({
  wpm,
  accuracy,
  errors,
  correctChars,
}: {
  wpm: number
  accuracy: number
  errors: number
  correctChars: number
}) {
  return (
    <div className="flex flex-col items-center gap-8">
      <h2 className="text-2xl font-bold text-foreground">Results</h2>
      <div className="flex items-center gap-10">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            WPM
          </span>
          <span className="text-5xl font-bold text-primary">{wpm}</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Accuracy
          </span>
          <span className="text-5xl font-bold text-primary">{accuracy}%</span>
        </div>
      </div>
      <div className="flex items-center gap-8 text-sm text-muted-foreground">
        <span>
          {correctChars} correct characters
        </span>
        <span>
          {errors} errors
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Press{" "}
        <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono">
          Tab
        </kbd>{" "}
        to restart
      </p>
    </div>
  )
}

export default App

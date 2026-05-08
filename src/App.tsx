import { useState, useRef, useLayoutEffect } from "react"
import { useTypingEngine } from "@/hooks/useTypingEngine"
import { loadSettings, saveSettings } from "@/lib/storage"
import { groupKanaHints, type KanaMode } from "@/lib/kana"
import type { GameType } from "@/lib/words"
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

function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[]
  value: T
  onChange: (value: T) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  useLayoutEffect(() => {
    const btn = buttonRefs.current.get(value)
    const container = containerRef.current
    if (!btn || !container) return
    const containerRect = container.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    setIndicator({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
    })
  }, [value, options])

  return (
    <div
      ref={containerRef}
      className="relative flex gap-1 rounded-xl border border-border bg-secondary p-1"
    >
      <div
        className="absolute top-1 bottom-1 rounded-lg bg-primary transition-all duration-200 ease-out"
        style={{ left: indicator.left, width: indicator.width }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          ref={(el) => {
            if (el) buttonRefs.current.set(opt.value, el)
          }}
          tabIndex={-1}
          onClick={() => onChange(opt.value)}
          className={`relative z-10 rounded-lg px-3 py-1 text-sm font-medium transition-colors duration-200 ${
            value === opt.value
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function App() {
  const [settings] = useState(loadSettings)
  const [gameType, setGameType] = useState<GameType>(settings.gameType)
  const [kanaMode, setKanaMode] = useState<KanaMode>(settings.kanaMode)
  const [duration, setDuration] = useState<TimerDuration>(settings.duration)
  const [showHints, setShowHints] = useState(settings.showHints)

  const engine = useTypingEngine(gameType, kanaMode, duration)

  function handleGameTypeChange(type: GameType) {
    setGameType(type)
    saveSettings({ gameType: type })
    engine.reset(type, undefined, undefined)
  }

  function handleModeChange(newMode: KanaMode) {
    setKanaMode(newMode)
    saveSettings({ kanaMode: newMode })
    engine.reset(undefined, newMode, undefined)
  }

  function handleDurationChange(dur: TimerDuration) {
    setDuration(dur)
    saveSettings({ duration: dur })
    engine.reset(undefined, undefined, dur)
  }

  function handleHintsToggle() {
    const next = !showHints
    setShowHints(next)
    saveSettings({ showHints: next })
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center px-8 py-4">
        <a
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
          onClick={(e) => {
            e.preventDefault()
            engine.reset()
          }}
        >
          <img
            src="/tanuki-type-logo.svg"
            alt="TanukiType logo"
            className="h-10 w-10"
          />
          <span className="text-2xl font-bold text-primary">TanukiType</span>
        </a>
      </header>

      {/* Main area */}
      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-8">
        {engine.phase === "finished" ? (
          <ResultsScreen
            wpm={engine.wpm}
            accuracy={engine.accuracy}
            errors={engine.errors}
            correctChars={engine.correctChars}
          />
        ) : (
          <>
            {/* Config row — fades out while typing */}
            <div
              className={`flex items-center gap-3 transition-opacity duration-300 ${engine.phase === "idle" ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <PillGroup
                options={[
                  { label: "Kana", value: "kana" as GameType },
                  { label: "Words", value: "words" as GameType },
                ]}
                value={gameType}
                onChange={handleGameTypeChange}
              />
              <PillGroup
                options={KANA_MODES}
                value={kanaMode}
                onChange={handleModeChange}
              />
              <PillGroup
                options={TIMER_DURATIONS.map((d) => ({
                  label: `${d}s`,
                  value: String(d) as `${TimerDuration}`,
                }))}
                value={String(duration) as `${TimerDuration}`}
                onChange={(v) =>
                  handleDurationChange(Number(v) as TimerDuration)
                }
              />
              <button
                tabIndex={-1}
                onClick={handleHintsToggle}
                className={`rounded-xl border px-3 py-1 text-sm font-medium transition-colors ${
                  showHints
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Hints
              </button>
            </div>

            {/* Kana display — key forces remount + fade-in on reset */}
            <KanaDisplay
              key={engine.resetKey}
              sequence={engine.sequence}
              charStates={engine.charStates}
              currentIndex={engine.currentIndex}
              inputBuffer={engine.inputBuffer}
              gameType={gameType}
              showHints={showHints}
            />

            {/* Timer — fades in while playing */}
            <div
              className={`transition-opacity duration-300 ${engine.phase === "playing" ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <span className="text-2xl font-bold tabular-nums text-foreground">
                {formatTime(engine.timeLeft)}
              </span>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center px-8 py-4">
        {engine.phase === "idle" && (
          <span className="text-sm text-muted-foreground">
            start typing to begin
          </span>
        )}
        {engine.phase === "playing" && (
          <Hotkey keyName="Tab" label="Restart" />
        )}
        {engine.phase === "finished" && (
          <Hotkey keyName="Tab" label="New game" />
        )}
      </footer>
    </div>
  )
}

function Hotkey({ keyName, label }: { keyName: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono">
        {keyName}
      </kbd>
      <span>{label}</span>
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
  gameType,
  showHints,
}: {
  sequence: { kana: string; romaji: string[] }[]
  charStates: ("correct" | "current" | "pending" | "error")[]
  currentIndex: number
  inputBuffer: string
  gameType: GameType
  showHints: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const currentKanaRef = useRef<HTMLSpanElement>(null)
  const [cursorStyle, setCursorStyle] = useState({
    left: 0,
    top: 0,
    height: 0,
  })

  const visibleStart = Math.max(
    0,
    currentIndex - (gameType === "words" ? 3 : 10)
  )
  const visibleEnd = Math.min(
    sequence.length,
    currentIndex + (gameType === "words" ? 12 : 40)
  )
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
  }, [currentIndex, fillPercent, sequence])

  return (
    <div
      ref={containerRef}
      className={`relative max-w-4xl animate-fade-in select-none text-center font-kana text-3xl ${showHints ? "leading-loose" : "leading-relaxed"}`}
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
            if (fill > 0 && !showHints) {
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

        const hintGroups = showHints && state !== "correct"
          ? groupKanaHints(entry.kana)
          : null
        const isMultiChar = [...entry.kana].length > 1

        return (
          <span key={absIndex} className="inline-block">
            <span
              ref={isCurrent ? currentKanaRef : undefined}
              className={`inline-block ${colorClass} transition-colors duration-150`}
              style={gradientStyle}
            >
              {hintGroups
                ? hintGroups.map((group, gi) => (
                    <span key={gi} className="relative inline-block">
                      <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[0.35em] text-muted-foreground">
                        {group.romaji}
                      </span>
                      {group.chars}
                    </span>
                  ))
                : entry.kana}
            </span>
            <span
              className={`inline-block ${isMultiChar ? "w-4" : "w-[0.3em]"}`}
            />
          </span>
        )
      })}
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
    <div className="flex flex-col items-center gap-10">
      <div className="flex items-center gap-12">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            WPM
          </span>
          <span className="text-6xl font-bold tabular-nums text-primary">
            {wpm}
          </span>
        </div>
        <div className="h-16 w-px bg-border" />
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Accuracy
          </span>
          <span className="text-6xl font-bold tabular-nums text-primary">
            {accuracy}%
          </span>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span>{correctChars} correct</span>
        <span className="text-border">|</span>
        <span>{errors} errors</span>
      </div>
    </div>
  )
}

export default App

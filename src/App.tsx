import { useState } from "react"
import { useTypingEngine } from "@/hooks/useTypingEngine"
import { loadSettings, saveSettings } from "@/lib/storage"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ConfigBar } from "@/components/game/config-bar"
import { KanaDisplay } from "@/components/game/kana-display"
import { GameTimer } from "@/components/game/game-timer"
import { ResultsScreen } from "@/components/results/results-screen"
import type { KanaMode } from "@/lib/kana"
import type { GameType } from "@/lib/words"
import type { TimerDuration } from "@/hooks/useTimer"

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
      <Header onLogoClick={() => engine.reset()} />

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
            <div
              className={`transition-opacity duration-300 ${engine.phase === "idle" ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <ConfigBar
                gameType={gameType}
                kanaMode={kanaMode}
                duration={duration}
                showHints={showHints}
                onGameTypeChange={handleGameTypeChange}
                onModeChange={handleModeChange}
                onDurationChange={handleDurationChange}
                onHintsToggle={handleHintsToggle}
              />
            </div>

            <KanaDisplay
              key={engine.resetKey}
              sequence={engine.sequence}
              charStates={engine.charStates}
              currentIndex={engine.currentIndex}
              inputBuffer={engine.inputBuffer}
              gameType={gameType}
              showHints={showHints}
            />

            <div
              className={`h-10 transition-opacity duration-300 ${engine.phase === "playing" ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <GameTimer
                duration={duration}
                timeLeft={engine.timeLeft}
                onFinish={() => engine.finish()}
              />
            </div>
          </>
        )}
      </main>

      <Footer phase={engine.phase} />
    </div>
  )
}

export default App

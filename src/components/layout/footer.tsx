import { Hotkey } from "@/components/ui/hotkey"
import { focusMobileInput } from "@/components/game/mobile-input"
import type { GamePhase } from "@/hooks/useTypingEngine"

export function Footer({
  phase,
  isTouch,
  onReset,
}: {
  phase: GamePhase
  isTouch: boolean
  onReset: () => void
}) {
  return (
    <footer className="flex items-center justify-center px-8 py-4">
      {phase === "idle" &&
        (isTouch ? (
          <button
            onClick={focusMobileInput}
            className="rounded-xl border border-border bg-secondary px-6 py-2 text-sm font-medium text-foreground transition-colors"
          >
            Tap to start
          </button>
        ) : (
          <span className="text-sm text-muted-foreground">
            start typing to begin
          </span>
        ))}
      {phase === "playing" &&
        (isTouch ? (
          <button
            onClick={onReset}
            className="rounded-xl border border-border bg-secondary px-6 py-2 text-sm font-medium text-foreground transition-colors"
          >
            Restart
          </button>
        ) : (
          <Hotkey keyName="Tab" label="Restart" />
        ))}
      {phase === "finished" &&
        (isTouch ? (
          <button
            onClick={() => {
              focusMobileInput()
              onReset()
            }}
            className="rounded-xl border border-border bg-secondary px-6 py-2 text-sm font-medium text-foreground transition-colors"
          >
            Play again
          </button>
        ) : (
          <Hotkey keyName="Tab" label="New game" />
        ))}
    </footer>
  )
}

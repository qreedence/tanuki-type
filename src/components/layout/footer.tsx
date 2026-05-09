import { Hotkey } from "@/components/ui/hotkey"
import type { GamePhase } from "@/hooks/useTypingEngine"

export function Footer({ phase }: { phase: GamePhase }) {
  return (
    <footer className="flex items-center justify-center px-8 py-4">
      {phase === "idle" && (
        <span className="text-sm text-muted-foreground">
          start typing to begin
        </span>
      )}
      {phase === "playing" && <Hotkey keyName="Tab" label="Restart" />}
      {phase === "finished" && <Hotkey keyName="Tab" label="New game" />}
    </footer>
  )
}

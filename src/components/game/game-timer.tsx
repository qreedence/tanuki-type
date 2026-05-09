import { formatTime } from "@/lib/format"
import type { TimerDuration } from "@/hooks/useTimer"

export function GameTimer({
  duration,
  timeLeft,
  onFinish,
}: {
  duration: TimerDuration
  timeLeft: number
  onFinish: () => void
}) {
  if (duration === 0) {
    return (
      <button
        tabIndex={-1}
        onClick={onFinish}
        className="rounded-xl border border-border bg-secondary px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Finish
      </button>
    )
  }

  return (
    <span className="text-2xl font-bold tabular-nums text-foreground">
      {formatTime(timeLeft)}
    </span>
  )
}

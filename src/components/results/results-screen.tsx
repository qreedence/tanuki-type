export function ResultsScreen({
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

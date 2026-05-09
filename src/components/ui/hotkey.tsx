export function Hotkey({ keyName, label }: { keyName: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <kbd className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono">
        {keyName}
      </kbd>
      <span>{label}</span>
    </div>
  )
}

import { useRef, useState, useLayoutEffect } from "react"
import { Infinity as InfinityIcon } from "lucide-react"

export function PillGroup<T extends string>({
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
          className={`relative z-10 flex items-center justify-center rounded-lg px-3 py-1 text-sm font-medium transition-colors duration-200 ${
            value === opt.value
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label === "infinity" ? (
            <InfinityIcon className="size-4" />
          ) : (
            opt.label
          )}
        </button>
      ))}
    </div>
  )
}

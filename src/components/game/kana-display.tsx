import { useRef, useState, useLayoutEffect } from "react"
import { groupKanaHints } from "@/lib/kana"
import type { GameType } from "@/lib/words"
import type { CharState } from "@/hooks/useTypingEngine"

function getFillPercent(buffer: string, romaji: string[]): number {
  if (!buffer) return 0
  const matching = romaji.filter((r) => r.startsWith(buffer))
  if (matching.length === 0) return 0
  const shortest = Math.min(...matching.map((r) => r.length))
  return buffer.length / shortest
}

export function KanaDisplay({
  sequence,
  charStates,
  currentIndex,
  inputBuffer,
  gameType,
  showHints,
}: {
  sequence: { kana: string; romaji: string[] }[]
  charStates: CharState[]
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

        const hintGroups =
          showHints && state !== "correct"
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

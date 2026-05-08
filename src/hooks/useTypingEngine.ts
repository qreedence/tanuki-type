import { useState, useCallback, useEffect, useRef } from "react"
import {
  generateSequence,
  isValidPrefix,
  isCompleteMatch,
  type KanaEntry,
  type KanaMode,
} from "@/lib/kana"
import { useTimer, type TimerDuration } from "@/hooks/useTimer"

export type CharState = "correct" | "current" | "pending" | "error"

export type GamePhase = "idle" | "playing" | "finished"

type EngineState = {
  sequence: KanaEntry[]
  currentIndex: number
  inputBuffer: string
  errors: number
  correctChars: number
  totalKeystrokes: number
  charStates: CharState[]
  phase: GamePhase
}

const SEQUENCE_LENGTH = 100

function createInitialState(mode: KanaMode): EngineState {
  const sequence = generateSequence(mode, SEQUENCE_LENGTH)
  return {
    sequence,
    currentIndex: 0,
    inputBuffer: "",
    errors: 0,
    correctChars: 0,
    totalKeystrokes: 0,
    charStates: sequence.map((_, i) => (i === 0 ? "current" : "pending")),
    phase: "idle",
  }
}

export function useTypingEngine(mode: KanaMode, duration: TimerDuration) {
  const [state, setState] = useState<EngineState>(() =>
    createInitialState(mode)
  )
  const startTimeRef = useRef<number | null>(null)
  const errorFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const finishGame = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "finished" }))
  }, [])

  const { timeLeft, isRunning, start: startTimer, reset: resetTimer } =
    useTimer(duration, finishGame)

  const reset = useCallback(
    (newMode?: KanaMode) => {
      if (errorFlashTimerRef.current) {
        clearTimeout(errorFlashTimerRef.current)
        errorFlashTimerRef.current = null
      }
      startTimeRef.current = null
      resetTimer()
      setState(createInitialState(newMode ?? mode))
    },
    [mode, resetTimer]
  )

  const handleKey = useCallback(
    (key: string) => {
      setState((prev) => {
        if (prev.phase === "finished") return prev

        if (key === "Tab") {
          return prev
        }

        if (key.length !== 1 || !/[a-z]/i.test(key)) return prev

        const char = key.toLowerCase()
        const phase: GamePhase =
          prev.phase === "idle" ? "playing" : prev.phase
        if (prev.phase === "idle") {
          startTimeRef.current = Date.now()
          startTimer()
        }

        const current = prev.sequence[prev.currentIndex]!
        const newBuffer = prev.inputBuffer + char
        const newTotalKeystrokes = prev.totalKeystrokes + 1

        if (isCompleteMatch(newBuffer, current.romaji)) {
          const newIndex = prev.currentIndex + 1
          const isFinished = newIndex >= prev.sequence.length
          const newCharStates = [...prev.charStates]
          newCharStates[prev.currentIndex] = "correct"
          if (!isFinished) {
            newCharStates[newIndex] = "current"
          }

          return {
            ...prev,
            phase: isFinished ? "finished" : phase,
            currentIndex: newIndex,
            inputBuffer: "",
            correctChars: prev.correctChars + 1,
            totalKeystrokes: newTotalKeystrokes,
            charStates: newCharStates,
          }
        }

        if (isValidPrefix(newBuffer, current.romaji)) {
          return {
            ...prev,
            phase,
            inputBuffer: newBuffer,
            totalKeystrokes: newTotalKeystrokes,
          }
        }

        const newCharStates = [...prev.charStates]
        newCharStates[prev.currentIndex] = "error"

        if (errorFlashTimerRef.current) {
          clearTimeout(errorFlashTimerRef.current)
        }
        errorFlashTimerRef.current = setTimeout(() => {
          setState((s) => {
            if (s.charStates[s.currentIndex] === "error") {
              const restored = [...s.charStates]
              restored[s.currentIndex] = "current"
              return { ...s, charStates: restored }
            }
            return s
          })
        }, 300)

        return {
          ...prev,
          phase,
          inputBuffer: "",
          errors: prev.errors + 1,
          totalKeystrokes: newTotalKeystrokes,
          charStates: newCharStates,
        }
      })
    },
    [startTimer]
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault()
        reset()
        return
      }

      if (state.phase === "finished") return

      if (e.metaKey || e.ctrlKey || e.altKey) return

      handleKey(e.key)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handleKey, reset, state.phase])

  const elapsedSeconds = startTimeRef.current
    ? Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000))
    : 0

  const wpm =
    state.correctChars > 0 && elapsedSeconds > 0
      ? Math.round((state.correctChars / elapsedSeconds) * 60)
      : 0

  const accuracy =
    state.totalKeystrokes > 0
      ? Math.round(
          ((state.totalKeystrokes - state.errors) / state.totalKeystrokes) * 100
        )
      : 100

  return {
    sequence: state.sequence,
    currentIndex: state.currentIndex,
    inputBuffer: state.inputBuffer,
    charStates: state.charStates,
    phase: state.phase,
    errors: state.errors,
    correctChars: state.correctChars,
    wpm,
    accuracy,
    timeLeft,
    isRunning,
    reset,
  }
}

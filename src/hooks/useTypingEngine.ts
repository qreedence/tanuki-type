import { useState, useCallback, useEffect, useRef } from "react"
import {
  generateSequence,
  isValidPrefix,
  isCompleteMatch,
  type KanaEntry,
  type KanaMode,
} from "@/lib/kana"
import { loadWords, wordsToSequence, type GameType } from "@/lib/words"
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
  finalElapsed: number | null
  resetKey: number
}

const BATCH_SIZE_KANA = 80
const BATCH_SIZE_WORDS = 25
const EXTEND_THRESHOLD = 15

let resetCounter = 0

function createState(sequence: KanaEntry[]): EngineState {
  return {
    sequence,
    currentIndex: 0,
    inputBuffer: "",
    errors: 0,
    correctChars: 0,
    totalKeystrokes: 0,
    charStates: sequence.map((_, i) => (i === 0 ? "current" : "pending")),
    phase: "idle",
    finalElapsed: null,
    resetKey: ++resetCounter,
  }
}

function extendSequence(
  prev: EngineState,
  extra: KanaEntry[]
): EngineState {
  return {
    ...prev,
    sequence: [...prev.sequence, ...extra],
    charStates: [
      ...prev.charStates,
      ...extra.map(() => "pending" as CharState),
    ],
  }
}

export function useTypingEngine(
  gameType: GameType,
  mode: KanaMode,
  duration: TimerDuration
) {
  const [state, setState] = useState<EngineState>(() =>
    createState(generateSequence(mode, BATCH_SIZE_KANA))
  )
  const mountedRef = useRef(false)
  const startTimeRef = useRef<number | null>(null)
  const errorFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wordCacheRef = useRef<KanaEntry[] | null>(null)
  const gameTypeRef = useRef(gameType)
  const modeRef = useRef(mode)
  gameTypeRef.current = gameType
  modeRef.current = mode

  const finishGame = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: "finished",
      finalElapsed: startTimeRef.current
        ? Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000))
        : 0,
    }))
  }, [])

  const { timeLeft, start: startTimer, reset: resetTimer } = useTimer(
    duration,
    finishGame
  )

  const initSequence = useCallback(
    async (type: GameType, kanaMode: KanaMode) => {
      if (type === "words") {
        const words = await loadWords("n5")
        const seq = wordsToSequence(words, BATCH_SIZE_WORDS, kanaMode)
        wordCacheRef.current = seq
        return seq
      }
      wordCacheRef.current = null
      return generateSequence(kanaMode, BATCH_SIZE_KANA)
    },
    []
  )

  const extendIfNeeded = useCallback(
    async (currentIndex: number, sequenceLength: number) => {
      const remaining = sequenceLength - currentIndex
      if (remaining > EXTEND_THRESHOLD) return

      let extra: KanaEntry[]
      if (gameTypeRef.current === "words") {
        const words = await loadWords("n5")
        extra = wordsToSequence(words, BATCH_SIZE_WORDS, modeRef.current)
      } else {
        extra = generateSequence(modeRef.current, BATCH_SIZE_KANA)
      }

      setState((prev) => extendSequence(prev, extra))
    },
    []
  )

  const reset = useCallback(
    async (
      newType?: GameType,
      newMode?: KanaMode,
      newDuration?: TimerDuration
    ) => {
      if (errorFlashTimerRef.current) {
        clearTimeout(errorFlashTimerRef.current)
        errorFlashTimerRef.current = null
      }
      startTimeRef.current = null
      resetTimer(newDuration)
      const sequence = await initSequence(newType ?? gameType, newMode ?? mode)
      setState(createState(sequence))
    },
    [gameType, mode, resetTimer, initSequence]
  )

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      if (gameType === "words") {
        reset()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleKey = useCallback(
    (key: string) => {
      setState((prev) => {
        if (prev.phase === "finished") return prev

        if (key === "Tab") return prev

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
          const newCharStates = [...prev.charStates]
          newCharStates[prev.currentIndex] = "correct"
          if (newIndex < prev.sequence.length) {
            newCharStates[newIndex] = "current"
          }

          // Trigger async extension (won't block this render)
          extendIfNeeded(newIndex, prev.sequence.length)

          return {
            ...prev,
            phase,
            currentIndex: newIndex,
            inputBuffer: "",
            correctChars: prev.correctChars + 1,
            totalKeystrokes: newTotalKeystrokes,
            charStates: newCharStates,
            finalElapsed: null,
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
    [startTimer, extendIfNeeded]
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

  const elapsedSeconds =
    state.finalElapsed ??
    (startTimeRef.current
      ? Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000))
      : 0)

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
    resetKey: state.resetKey,
    reset,
    finish: finishGame,
  }
}

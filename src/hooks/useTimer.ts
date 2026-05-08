import { useState, useRef, useCallback } from "react"

export type TimerDuration = 15 | 30 | 60 | 120

export function useTimer(duration: TimerDuration, onExpire: () => void) {
  const [timeLeft, setTimeLeft] = useState<number>(duration)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  const start = useCallback(() => {
    if (intervalRef.current) return
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          intervalRef.current = null
          setIsRunning(false)
          onExpireRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const reset = useCallback(
    (newDuration?: TimerDuration) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setIsRunning(false)
      setTimeLeft(newDuration ?? duration)
    },
    [duration]
  )

  return { timeLeft, isRunning, start, reset }
}

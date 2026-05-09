import { useRef, useEffect } from "react"

export function MobileInput({
  onKey,
  onReset,
  disabled,
  suppressFocus,
}: {
  onKey: (key: string) => void
  onReset: () => void
  disabled: boolean
  suppressFocus: boolean
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const onKeyRef = useRef(onKey)
  const disabledRef = useRef(disabled)
  onKeyRef.current = onKey
  disabledRef.current = disabled

  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.value = " "

    const handleInput = () => {
      if (disabledRef.current) {
        input.value = " "
        return
      }

      const val = input.value
      for (const ch of val) {
        if (/[a-z]/i.test(ch)) {
          onKeyRef.current(ch)
        }
      }

      input.value = " "
    }

    input.addEventListener("input", handleInput)
    return () => input.removeEventListener("input", handleInput)
  }, [])

  return (
    <textarea
      ref={inputRef}
      id="mobile-input"
      autoCapitalize="none"
      autoCorrect="off"
      autoComplete="off"
      spellCheck={false}
      className="pointer-events-none fixed bottom-0 left-0 h-px w-px opacity-0"
      onBlur={() => {
        if (suppressFocus) return
        setTimeout(() => inputRef.current?.focus(), 100)
      }}
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          e.preventDefault()
          onReset()
        }
      }}
    />
  )
}

export function focusMobileInput() {
  const input = document.getElementById("mobile-input") as HTMLTextAreaElement
  input?.focus()
  setTimeout(() => {
    document.querySelector("[data-slot='mobile-timer']")?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    })
  }, 150)
}

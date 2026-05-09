import {
  DrawerRoot,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/base-drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice"
import type { KanaMode } from "@/lib/kana"
import type { GameType } from "@/lib/words"
import type { TimerDuration } from "@/hooks/useTimer"

function SettingsRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="w-44">{children}</div>
    </div>
  )
}

type SelectOption = { value: string; label: string }

function NativeSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-lg border border-input bg-transparent px-3 py-1.5 text-right text-sm font-medium text-foreground"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function StyledSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v)
      }}
    >
      <SelectTrigger className="w-full capitalize">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function SettingsDrawer({
  open,
  onOpenChange,
  gameType,
  kanaMode,
  duration,
  showHints,
  onGameTypeChange,
  onModeChange,
  onDurationChange,
  onHintsToggle,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameType: GameType
  kanaMode: KanaMode
  duration: TimerDuration
  showHints: boolean
  onGameTypeChange: (type: GameType) => void
  onModeChange: (mode: KanaMode) => void
  onDurationChange: (dur: TimerDuration) => void
  onHintsToggle: () => void
}) {
  const isTouch = useIsTouchDevice()
  const SettingsSelect = isTouch ? NativeSelect : StyledSelect

  return (
    <DrawerRoot open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col pb-6">
          <SettingsRow label="Mode">
            <SettingsSelect
              value={gameType}
              onChange={(v) => onGameTypeChange(v as GameType)}
              options={[
                { value: "kana", label: "Kana" },
                { value: "words", label: "Words" },
              ]}
            />
          </SettingsRow>
          <SettingsRow label="Script">
            <SettingsSelect
              value={kanaMode}
              onChange={(v) => onModeChange(v as KanaMode)}
              options={[
                { value: "hiragana", label: "Hiragana" },
                { value: "katakana", label: "Katakana" },
                { value: "mixed", label: "Mixed" },
              ]}
            />
          </SettingsRow>
          <SettingsRow label="Duration">
            <SettingsSelect
              value={String(duration)}
              onChange={(v) => onDurationChange(Number(v) as TimerDuration)}
              options={[
                { value: "30", label: "30 seconds" },
                { value: "60", label: "60 seconds" },
                { value: "120", label: "120 seconds" },
                { value: "0", label: "No limit" },
              ]}
            />
          </SettingsRow>
          <SettingsRow label="Hints">
            <SettingsSelect
              value={showHints ? "on" : "off"}
              onChange={(v) => {
                if ((v === "on") !== showHints) onHintsToggle()
              }}
              options={[
                { value: "off", label: "Off" },
                { value: "on", label: "On" },
              ]}
            />
          </SettingsRow>
        </div>
      </DrawerContent>
    </DrawerRoot>
  )
}

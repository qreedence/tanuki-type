import { Settings } from "lucide-react"

export function Header({
  onLogoClick,
  onSettingsClick,
}: {
  onLogoClick: () => void
  onSettingsClick: () => void
}) {
  return (
    <header className="flex items-center justify-between px-8 py-4">
      <a
        href="/"
        className="flex items-center gap-3 transition-opacity hover:opacity-80"
        onClick={(e) => {
          e.preventDefault()
          onLogoClick()
        }}
      >
        <img
          src="/tanuki-type-logo.svg"
          alt="TanukiType logo"
          className="h-10 w-10"
        />
        <span className="text-2xl font-bold text-primary">TanukiType</span>
      </a>
      <button
        tabIndex={-1}
        onClick={onSettingsClick}
        className="text-muted-foreground transition-colors hover:text-foreground md:hidden"
      >
        <Settings className="size-5" />
      </button>
    </header>
  )
}

export function Header({ onLogoClick }: { onLogoClick: () => void }) {
  return (
    <header className="flex items-center px-8 py-4">
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
    </header>
  )
}

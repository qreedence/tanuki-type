import { Drawer } from "@base-ui/react/drawer"

import { cn } from "@/lib/utils"

const DrawerRoot = Drawer.Root
const DrawerTrigger = Drawer.Trigger
const DrawerClose = Drawer.Close

function DrawerContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Drawer.Portal>
      <Drawer.Backdrop className="fixed inset-0 z-50 bg-black/10 backdrop-blur-xs transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
        <Drawer.Popup
          className={cn(
            "flex max-h-[80vh] w-full flex-col rounded-t-xl border-t bg-popover text-popover-foreground outline-none transition-transform duration-300 ease-out data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
            className
          )}
        >
          <div className="mx-auto mt-4 h-1 w-[100px] shrink-0 rounded-full bg-muted" />
          <Drawer.Content>{children}</Drawer.Content>
        </Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.Portal>
  )
}

function DrawerHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-0.5 p-4 text-center", className)}>
      {children}
    </div>
  )
}

function DrawerTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <Drawer.Title
      className={cn("text-lg font-semibold tracking-tight text-foreground", className)}
    >
      {children}
    </Drawer.Title>
  )
}

export {
  DrawerRoot,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
}

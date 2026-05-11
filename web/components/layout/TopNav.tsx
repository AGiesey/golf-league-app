import { SidebarToggle } from "./SidebarToggle";

interface TopNavProps {
  navSlot?: React.ReactNode;
  userMenuSlot?: React.ReactNode;
}

export function TopNav({ navSlot, userMenuSlot }: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="flex h-14 items-center gap-4 px-4">
        <SidebarToggle />
        {/* Logo / wordmark — placeholder until a real mark is designed */}
        <span className="font-semibold text-primary-600 tracking-tight">
          Golf League
        </span>
        {/* Navigation slot */}
        {navSlot && <nav className="ml-4 flex items-center gap-2">{navSlot}</nav>}
        <div className="ml-auto flex items-center">
          {userMenuSlot}
        </div>
      </div>
    </header>
  );
}

import { SidebarToggle } from "./SidebarToggle";

// Navigation slot — empty now; a future proposal will populate this with
// role-aware links (Commissioner vs Golfer views).
interface TopNavProps {
  navSlot?: React.ReactNode;
}

export function TopNav({ navSlot }: TopNavProps) {
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
      </div>
    </header>
  );
}

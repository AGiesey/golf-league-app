"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href?: string;
  disabled?: boolean;
}

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = !!item.href && pathname.startsWith(item.href);

  if (item.disabled || !item.href) {
    return (
      <span className="flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground cursor-default">
        {item.label}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      {item.label}
    </Link>
  );
}

function NavList({ isCommissioner }: { isCommissioner: boolean }) {
  const items: NavItem[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Profile", href: "/me" },
    { label: "Scores / Rounds", disabled: true },
    ...(isCommissioner ? [{ label: "Commissioner", href: "/commissioner" }] : []),
  ];

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <NavLink key={item.label} item={item} />
      ))}
    </nav>
  );
}

interface SidebarProps {
  isCommissioner?: boolean;
}

// Sidebar scaffold — persistent on desktop (md+), collapsible on mobile.
// On desktop: normal flex child (w-64, static position in document flow).
// On mobile: fixed overlay that slides in when open.
export function Sidebar({ isCommissioner = false }: SidebarProps) {
  const { open, close } = useSidebar();

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={close}
          aria-hidden
        />
      )}

      {/* Desktop: static sidebar in document flow (no fixed) */}
      <aside
        className="hidden w-64 shrink-0 border-r border-border bg-sidebar md:flex md:flex-col"
        aria-label="Main navigation"
      >
        <div className="flex-1 overflow-y-auto p-4">
          <NavList isCommissioner={isCommissioner} />
        </div>
      </aside>

      {/* Mobile: fixed overlay sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-sidebar",
          "flex flex-col pt-14 transition-transform duration-200 md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Main navigation"
        aria-hidden={!open}
      >
        <div className="flex-1 overflow-y-auto p-4">
          <NavList isCommissioner={isCommissioner} />
        </div>
      </aside>
    </>
  );
}

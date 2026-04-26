"use client";

import { useSidebar } from "./SidebarContext";
import { cn } from "@/lib/utils";

// Sidebar scaffold — persistent on desktop (md+), collapsible on mobile.
// On desktop: normal flex child (w-64, static position in document flow).
// On mobile: fixed overlay that slides in when open.
export function Sidebar() {
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
          {/* Navigation items slot — populated by future proposals */}
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
          {/* Navigation items slot */}
        </div>
      </aside>
    </>
  );
}

"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { Button } from "@/components/ui/button";

export function SidebarToggle() {
  const { toggle } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={toggle}
      aria-label="Toggle navigation"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}

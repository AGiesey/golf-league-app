"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0];
}

interface UserMenuProps {
  golferName: string;
  isCommissioner: boolean;
}

export function UserMenu({ golferName, isCommissioner }: UserMenuProps) {
  if (!golferName) return null;

  const initials = getInitials(golferName);
  const firstName = getFirstName(golferName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${golferName}`}
        className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar size="sm">
          <AvatarFallback aria-hidden="true">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline text-sm font-medium">{firstName}</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="shadow-popover min-w-48">
        {/* Dropdown header */}
        <div className="flex items-center gap-2 px-2 py-3 min-h-[44px]">
          <span className="text-sm font-medium leading-none">{golferName}</span>
          {isCommissioner && (
            <Badge variant="secondary" className="shrink-0">
              Commissioner
            </Badge>
          )}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="min-h-[44px]"
          render={<a href="/me" />}
        >
          My Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="min-h-[44px]"
          render={<a href="/api/auth/logout" />}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

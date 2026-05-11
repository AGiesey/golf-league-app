"use client";

import { Loader2, Pencil, Check, X } from "lucide-react";
import type { Team } from "./TeamsTab";

interface TeamCardProps {
  team: Team;
  isLocked: boolean;
  isEditing: boolean;
  editingName: string;
  isSaving: boolean;
  isDisbanding: boolean;
  onStartEdit: () => void;
  onNameChange: (name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDisband: () => void;
}

export function TeamCard({
  team,
  isLocked,
  isEditing,
  editingName,
  isSaving,
  isDisbanding,
  onStartEdit,
  onNameChange,
  onSaveEdit,
  onCancelEdit,
  onDisband,
}: TeamCardProps) {
  return (
    <li className="flex items-start justify-between rounded border border-border p-3">
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={editingName}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveEdit();
                if (e.key === "Escape") onCancelEdit();
              }}
              disabled={isSaving}
              className="w-full rounded border border-input bg-background px-2 py-0.5 text-sm font-medium disabled:opacity-50"
            />
            <button
              onClick={onSaveEdit}
              disabled={isSaving || !editingName.trim()}
              className="shrink-0 text-green-600 hover:opacity-70 disabled:opacity-40"
              aria-label="Save name"
            >
              {isSaving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
            </button>
            <button
              onClick={onCancelEdit}
              disabled={isSaving}
              className="shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-40"
              aria-label="Cancel"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium">{team.name}</p>
            <button
              onClick={onStartEdit}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Rename team"
            >
              <Pencil className="size-3" />
            </button>
          </div>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {team.members.map((m) => `${m.lastName}, ${m.firstName}`).join(" · ")}
        </p>
      </div>
      {!isLocked && !isEditing && (
        <button
          onClick={onDisband}
          disabled={isDisbanding}
          className="ml-3 shrink-0 text-xs text-destructive hover:underline disabled:opacity-50"
        >
          {isDisbanding ? <Loader2 className="size-3.5 animate-spin" /> : "Disband"}
        </button>
      )}
    </li>
  );
}

"use client";

import { Loader2, Lock, Pencil, Trash2 } from "lucide-react";
import type { Matchup } from "./MatchupsClient";

interface MatchupListItemProps {
  matchup: Matchup;
  deleting: string | null;
  onEdit: (matchup: Matchup) => void;
  onDelete: (matchupId: string) => void;
}

export function MatchupListItem({ matchup: m, deleting, onEdit, onDelete }: MatchupListItemProps) {
  return (
    <li className="flex items-start justify-between rounded border border-border p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {m.teamA.name} vs {m.teamB.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {m.teamA.members
            .map((mb) => `${mb.lastName}, ${mb.firstName}`)
            .join(" · ")}
          {" — "}
          {m.teamB.members
            .map((mb) => `${mb.lastName}, ${mb.firstName}`)
            .join(" · ")}
        </p>
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-2">
        {m.isLocked ? (
          <Lock
            className="size-4 text-muted-foreground"
            aria-label="Locked — scores have been entered"
          />
        ) : (
          <>
            <button
              onClick={() => onEdit(m)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Edit matchup"
            >
              <Pencil className="size-4" />
            </button>
            <button
              onClick={() => onDelete(m.matchupId)}
              disabled={deleting === m.matchupId}
              className="text-destructive hover:opacity-70 disabled:opacity-50"
              aria-label="Delete matchup"
            >
              {deleting === m.matchupId ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </button>
          </>
        )}
      </div>
    </li>
  );
}

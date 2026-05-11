"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Team {
  teamId: string;
  name: string;
}

interface MatchupFormDialogProps {
  open: boolean;
  isEditing: boolean;
  teams: Team[];
  teamAId: string;
  teamBId: string;
  submitting: boolean;
  pairWarning: number | null;
  onTeamAChange: (id: string) => void;
  onTeamBChange: (id: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function MatchupFormDialog({
  open,
  isEditing,
  teams,
  teamAId,
  teamBId,
  submitting,
  pairWarning,
  onTeamAChange,
  onTeamBChange,
  onSubmit,
  onClose,
}: MatchupFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Matchup" : "Create Matchup"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="team-a" className="text-sm font-medium">
              Team A
            </label>
            <select
              id="team-a"
              value={teamAId}
              onChange={(e) => onTeamAChange(e.target.value)}
              className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="">Select team…</option>
              {teams
                .filter((t) => t.teamId !== teamBId)
                .map((t) => (
                  <option key={t.teamId} value={t.teamId}>
                    {t.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="team-b" className="text-sm font-medium">
              Team B
            </label>
            <select
              id="team-b"
              value={teamBId}
              onChange={(e) => onTeamBChange(e.target.value)}
              className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="">Select team…</option>
              {teams
                .filter((t) => t.teamId !== teamAId)
                .map((t) => (
                  <option key={t.teamId} value={t.teamId}>
                    {t.name}
                  </option>
                ))}
            </select>
          </div>

          {pairWarning !== null && (
            <div className="flex items-center gap-1.5 rounded bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              <AlertTriangle className="size-3.5 shrink-0" />
              Already played — Week {pairWarning}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!teamAId || !teamBId || submitting}
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { H3 } from "@/components/typography";

interface MatchupRow {
  matchupId: string;
  teamA: string;
  teamB: string;
  teeTime: string | null;
  players: string;
  slotCount: number;
  roundCount: number;
}

function statusPill(slotCount: number, roundCount: number) {
  if (slotCount === 0) return { label: "No matchups", variant: "secondary" as const, className: "" };
  if (roundCount === 0) return { label: "Not started", variant: "outline" as const, className: "" };
  if (roundCount < slotCount) return { label: "Partial", variant: "default" as const, className: "bg-warning-500 text-white hover:bg-warning-500" };
  return { label: "Complete", variant: "default" as const, className: "bg-success-500 text-white hover:bg-success-500" };
}

function WeekDetail({ matchups }: { matchups: MatchupRow[] }) {
  return (
    <div className="divide-y divide-border rounded-lg border border-border max-w-2xl">
      {matchups.map((m) => {
        const pill = statusPill(m.slotCount, m.roundCount);
        return (
          <div key={m.matchupId} className="flex items-center justify-between px-4 py-4 first:rounded-t-lg last:rounded-b-lg hover:bg-accent transition-colors cursor-pointer">
            <div className="space-y-1">
              <p className="text-sm font-medium">{m.teamA} vs {m.teamB}</p>
              <p className="text-xs text-muted-foreground">
                {m.teeTime && <>{m.teeTime} · </>}{m.players}
              </p>
            </div>
            <Badge variant={pill.variant} className={pill.className}>{pill.label}</Badge>
          </div>
        );
      })}
    </div>
  );
}

const NOT_STARTED: MatchupRow[] = [
  { matchupId: "m1", teamA: "Team Alpha", teamB: "Team Birdie", teeTime: "6:00 PM", players: "Jim Harper · Mike Chen", slotCount: 2, roundCount: 0 },
  { matchupId: "m2", teamA: "Team Eagle", teamB: "Team Par", teeTime: "6:30 PM", players: "Dave Torres · Sam Lee", slotCount: 2, roundCount: 0 },
];

const PARTIAL: MatchupRow[] = [
  { matchupId: "m3", teamA: "Team Alpha", teamB: "Team Birdie", teeTime: "6:00 PM", players: "Jim Harper · Mike Chen", slotCount: 2, roundCount: 1 },
  { matchupId: "m4", teamA: "Team Eagle", teamB: "Team Par", teeTime: "6:30 PM", players: "Dave Torres · Sam Lee", slotCount: 2, roundCount: 2 },
];

const COMPLETE: MatchupRow[] = [
  { matchupId: "m5", teamA: "Team Alpha", teamB: "Team Birdie", teeTime: "6:00 PM", players: "Jim Harper · Mike Chen", slotCount: 2, roundCount: 2 },
  { matchupId: "m6", teamA: "Team Eagle", teamB: "Team Par", teeTime: "6:30 PM", players: "Dave Torres · Sam Lee", slotCount: 2, roundCount: 2 },
];

export function WeekDetailExamples() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <H3>Not started</H3>
        <WeekDetail matchups={NOT_STARTED} />
      </div>
      <div className="space-y-2">
        <H3>Partial</H3>
        <WeekDetail matchups={PARTIAL} />
      </div>
      <div className="space-y-2">
        <H3>Complete</H3>
        <WeekDetail matchups={COMPLETE} />
      </div>
    </div>
  );
}

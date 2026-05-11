"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H3, Muted } from "@/components/typography";

function MatchupCard({ weekNumber, date, nine, teeTime, opponentName, matchupId }: {
  weekNumber: number;
  date: string;
  nine: string;
  teeTime?: string;
  opponentName: string;
  matchupId: string;
}) {
  return (
    <Link
      href={`/matchups/${matchupId}`}
      className="block rounded-lg border border-border bg-card p-4 hover:bg-accent transition-colors"
    >
      <p className="text-sm font-semibold">Week {weekNumber} · {date}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {nine}{teeTime && ` · ${teeTime}`}
      </p>
      <p className="mt-1 text-sm">vs <span className="font-medium">{opponentName}</span></p>
    </Link>
  );
}

function Widget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <H3>{title}</H3>
      <Card className="max-w-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="size-4" />
            Upcoming Matchup
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

export function UpcomingMatchupExamples() {
  return (
    <div className="space-y-8">
      <Widget title="One matchup">
        <MatchupCard
          weekNumber={4}
          date="Jun 11"
          nine="Front 9"
          teeTime="6:30 PM"
          opponentName="Team Birdie"
          matchupId="demo-1"
        />
      </Widget>

      <Widget title="Multiple matchups (split week)">
        <div className="space-y-2">
          <MatchupCard weekNumber={5} date="Jun 18" nine="Front 9" teeTime="6:00 PM" opponentName="Team Eagle" matchupId="demo-2" />
          <MatchupCard weekNumber={5} date="Jun 18" nine="Back 9" teeTime="6:30 PM" opponentName="Team Par" matchupId="demo-3" />
        </div>
      </Widget>

      <Widget title="Empty — no matchup scheduled">
        <Muted>No matchup scheduled this week.</Muted>
      </Widget>
    </div>
  );
}

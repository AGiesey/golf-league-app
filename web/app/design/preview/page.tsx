// Design preview — static page with hardcoded dummy data for visual review of the
// Upcoming Matchup widget. Not a real feature. Will be replaced when the dashboard
// is specced and built.

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { H4, Body, Muted } from "@/components/typography";

// ── Types ──────────────────────────────────────────────────────────────────

type Golfer = {
  name: string;
  handicap: number;
  initials: string;
};

type Team = {
  name: string;
  members: [Golfer, Golfer];
};

type MatchupPreview = {
  league: string;
  season: number;
  week: number;
  date: string;
  teeTime: string;
  status: string;
  myTeam: Team;
  opponent: Team;
};

// ── Dummy data ─────────────────────────────────────────────────────────────

const matchup: MatchupPreview = {
  league: "Oak Hills Wednesday Night League",
  season: 2026,
  week: 7,
  date: "Wed, May 6",
  teeTime: "5:30 PM",
  status: "Upcoming",
  myTeam: {
    name: "The Putt Pirates",
    members: [
      { name: "Alice Anderson", handicap: 12.4, initials: "AA" },
      { name: "Bob Baker", handicap: 18.2, initials: "BB" },
    ],
  },
  opponent: {
    name: "Fairway Frequent Flyers",
    members: [
      { name: "Carol Chen", handicap: 9.8, initials: "CC" },
      { name: "Dan Davis", handicap: 15.6, initials: "DD" },
    ],
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function avgHandicap(members: [Golfer, Golfer]): string {
  return ((members[0].handicap + members[1].handicap) / 2).toFixed(1);
}

// ── Sub-components ─────────────────────────────────────────────────────────

function TeamSection({ team, label }: { team: Team; label: string }) {
  return (
    <div className="flex flex-col gap-3">
      <Muted className="font-semibold uppercase tracking-wider">{label}</Muted>
      <H4>{team.name}</H4>
      <div className="flex flex-col gap-2">
        {team.members.map((golfer) => (
          <div key={golfer.name} className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{golfer.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 items-center justify-between">
              <Body>{golfer.name}</Body>
              <Muted>HCP {golfer.handicap.toFixed(1)}</Muted>
            </div>
          </div>
        ))}
      </div>
      <Muted>Avg team handicap: {avgHandicap(team.members)}</Muted>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function MatchupPreviewPage() {
  return (
    <div className="mx-auto max-w-2xl py-8">
      <Card className="shadow-card">
        <CardHeader className="border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Muted>
                {matchup.league} · {matchup.season} Season
              </Muted>
              <CardTitle>Week {matchup.week} Matchup</CardTitle>
              <CardDescription>
                {matchup.date} · {matchup.teeTime}
              </CardDescription>
            </div>
            <Badge variant="outline">{matchup.status}</Badge>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <TeamSection team={matchup.myTeam} label="Your team" />

          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              vs
            </span>
            <div className="flex-1 border-t border-border" />
          </div>

          <TeamSection team={matchup.opponent} label="Opponent" />
        </CardContent>

        <CardFooter className="gap-3">
          <Button variant="default">View scorecard</Button>
          <Button variant="ghost">View pairing details</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

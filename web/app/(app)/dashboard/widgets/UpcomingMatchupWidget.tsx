import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetchAuthenticated } from "@/lib/api";

interface UpcomingSlot {
  slotId: string;
  playerName: string;
  hasRound: boolean;
}

interface UpcomingPairing {
  teeTime: string | null;
  slots: UpcomingSlot[];
}

interface UpcomingMatchup {
  matchupId: string;
  week: { number: number; startDate: string; nine: string };
  myTeam: { name: string };
  opponentTeam: { name: string };
  pairings: UpcomingPairing[];
}

interface UpcomingMatchupsResponse {
  matchups: UpcomingMatchup[];
  reason?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function nineLabel(nine: string) {
  if (nine === "Front") return "Front 9";
  if (nine === "Back") return "Back 9";
  return "18 holes";
}

function reasonText(reason?: string) {
  if (reason === "no_upcoming_week") return "Season ended — no upcoming weeks.";
  if (reason === "no_matchup_this_week") return "No matchup scheduled this week.";
  return "No upcoming matchup.";
}

function MatchupCard({ matchup }: { matchup: UpcomingMatchup }) {
  const teeTime = matchup.pairings[0]?.teeTime;

  return (
    <Link
      href={`/matchups/${matchup.matchupId}`}
      className="block rounded-lg border border-border bg-card p-4 hover:bg-accent transition-colors"
    >
      <p className="text-sm font-semibold">
        Week {matchup.week.number} · {formatDate(matchup.week.startDate)}
      </p>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {nineLabel(matchup.week.nine)}
        {teeTime && ` · ${teeTime}`}
      </p>
      <p className="mt-1 text-sm">
        vs <span className="font-medium">{matchup.opponentTeam.name}</span>
      </p>
    </Link>
  );
}

interface Props {
  membershipId: string;
  token: string;
}

export async function UpcomingMatchupWidget({ membershipId, token }: Props) {
  let data: UpcomingMatchupsResponse;
  try {
    data = await apiFetchAuthenticated<UpcomingMatchupsResponse>(
      "/me/upcoming-matchups",
      token,
      { headers: { "X-Membership-Id": membershipId }, cache: "no-store" },
    );
  } catch {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4" />
          Upcoming Matchup
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.matchups.length === 0 ? (
          <p className="text-sm text-muted-foreground">{reasonText(data.reason)}</p>
        ) : (
          <div className="space-y-2">
            {data.matchups.map((m) => (
              <MatchupCard key={m.matchupId} matchup={m} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

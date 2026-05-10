import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MatchupTeam {
  name: string;
  members: { firstName: string; lastName: string }[];
}

interface UpcomingMatchup {
  matchupId: string | null;
  weekNumber: number;
  startDate: string;
  myTeam: MatchupTeam;
  opponent: MatchupTeam;
}

interface PreviousMatchup extends UpcomingMatchup {
  hasResults: boolean;
}

export interface MatchupSummary {
  upcoming: UpcomingMatchup | null;
  previous: PreviousMatchup | null;
}

function formatMatchupDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function MatchupWidget({ summary }: { summary: MatchupSummary }) {
  const { upcoming, previous } = summary;

  if (!upcoming && !previous) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">My Matchups</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Calendar className="size-3" />
            Upcoming
          </p>
          {upcoming ? (
            <MatchupSection matchup={upcoming} />
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming matchup scheduled.</p>
          )}
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock className="size-3" />
            Last Match
          </p>
          {previous ? (
            <MatchupSection matchup={previous} />
          ) : (
            <p className="text-sm text-muted-foreground">No previous matches yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MatchupSection({ matchup }: { matchup: UpcomingMatchup & { hasResults?: boolean } }) {
  const content = (
    <div className="space-y-0.5">
      <p className="text-sm font-medium">
        Week {matchup.weekNumber} · {formatMatchupDate(matchup.startDate)}
      </p>
      <p className="text-sm">vs {matchup.opponent.name}</p>
      <p className="text-xs text-muted-foreground">
        {matchup.opponent.members
          .map((m) => `${m.firstName} ${m.lastName}`)
          .join(" & ")}
      </p>
      {"hasResults" in matchup && !matchup.hasResults && (
        <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          Results pending
        </p>
      )}
    </div>
  );

  if (matchup.matchupId) {
    return (
      <Link
        href={`/matchups/${matchup.matchupId}`}
        className="block rounded-md p-2 -m-2 hover:bg-accent transition-colors"
      >
        {content}
      </Link>
    );
  }

  return content;
}

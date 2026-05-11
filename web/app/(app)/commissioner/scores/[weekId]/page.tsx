import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { resolveLeagueContext } from "@/lib/leagueContext";
import { getAccessToken } from "@/lib/auth";
import { apiFetchAuthenticated } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { H1, Muted } from "@/components/typography";

interface SlotInfo {
  playerName: string;
}

interface PairingInfo {
  teeTime: string | null;
  slots: SlotInfo[];
}

interface MatchupEntry {
  matchupId: string;
  teamA: { name: string };
  teamB: { name: string };
  pairings: PairingInfo[];
  slotCount: number;
  roundCount: number;
}

interface WeekDetailResponse {
  weekId: string;
  weekNumber: number;
  startDate: string;
  type: string;
  nine: string;
  matchups: MatchupEntry[];
}

function statusPill(slotCount: number, roundCount: number) {
  if (slotCount === 0) return { label: "No matchups", variant: "secondary" as const };
  if (roundCount === 0) return { label: "Not started", variant: "outline" as const };
  if (roundCount < slotCount) return { label: "Partial", variant: "default" as const };
  return { label: "Complete", variant: "default" as const };
}

function nineLabel(nine: string) {
  if (nine === "Front") return "Front 9";
  if (nine === "Back") return "Back 9";
  return "18 holes";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default async function WeekDetailPage({
  params,
}: {
  params: Promise<{ weekId: string }>;
}) {
  await connection();

  const ctx = await resolveLeagueContext();
  if (!ctx) redirect("/login");
  if (ctx.status !== "resolved" || !ctx.context.isCommissioner) redirect("/dashboard");

  const { leagueMembershipId: membershipId } = ctx.context;
  const token = await getAccessToken();
  const { weekId } = await params;

  const data = await apiFetchAuthenticated<WeekDetailResponse>(
    `/commissioner/weeks/${weekId}/score-entry`,
    token,
    { headers: { "X-Membership-Id": membershipId }, cache: "no-store" },
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Link
            href="/commissioner/scores"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Manage Scores
          </Link>
        </div>
        <H1 className="mt-2">Week {data.weekNumber}</H1>
        <div className="mt-1 flex items-center gap-2">
          <Muted>{formatDate(data.startDate)}</Muted>
          <Badge variant="secondary">{data.type}</Badge>
          <Badge variant="outline">{nineLabel(data.nine)}</Badge>
        </div>
      </div>

      {data.matchups.length === 0 ? (
        <p className="rounded-lg border border-border px-4 py-6 text-center text-sm text-muted-foreground">
          No matchups scheduled for this week.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {data.matchups.map((matchup) => {
            const pill = statusPill(matchup.slotCount, matchup.roundCount);
            const pairing = matchup.pairings[0];

            return (
              <Link
                key={matchup.matchupId}
                href={`/matchups/${matchup.matchupId}?from=${weekId}`}
                className="flex items-center justify-between px-4 py-4 hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {matchup.teamA.name} vs {matchup.teamB.name}
                  </p>
                  {pairing && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {pairing.teeTime && <span>{pairing.teeTime}</span>}
                      <span>{pairing.slots.map((s) => s.playerName).join(" · ")}</span>
                    </div>
                  )}
                </div>
                <Badge
                  variant={pill.variant}
                  className={
                    pill.label === "Complete"
                      ? "bg-success-500 text-white hover:bg-success-500"
                      : pill.label === "Partial"
                        ? "bg-warning-500 text-white hover:bg-warning-500"
                        : ""
                  }
                >
                  {pill.label}
                </Badge>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

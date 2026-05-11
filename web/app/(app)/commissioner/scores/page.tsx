import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { resolveLeagueContext } from "@/lib/leagueContext";
import { getAccessToken } from "@/lib/auth";
import { apiFetchAuthenticated } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { H1, Muted } from "@/components/typography";

interface WeekEntry {
  weekId: string;
  weekNumber: number;
  startDate: string;
  type: string;
  nine: string;
  matchupCount: number;
  slotCount: number;
  roundCount: number;
}

interface WeeksResponse {
  weeks: WeekEntry[];
}

function statusPill(week: WeekEntry) {
  if (week.slotCount === 0) return { label: "No matchups", variant: "secondary" as const };
  if (week.roundCount === 0) return { label: "Not started", variant: "outline" as const };
  if (week.roundCount < week.slotCount) return { label: "Partial", variant: "default" as const };
  return { label: "Complete", variant: "default" as const };
}

function nineLabel(nine: string) {
  if (nine === "Front") return "Front 9";
  if (nine === "Back") return "Back 9";
  return "18 holes";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default async function ScoresPage() {
  await connection();

  const ctx = await resolveLeagueContext();
  if (!ctx) redirect("/login");
  if (ctx.status !== "resolved" || !ctx.context.isCommissioner) redirect("/dashboard");

  const { leagueMembershipId: membershipId, seasonId } = ctx.context;
  const token = await getAccessToken();

  const { weeks } = await apiFetchAuthenticated<WeeksResponse>(
    `/commissioner/seasons/${seasonId}/score-entry/weeks`,
    token,
    { headers: { "X-Membership-Id": membershipId }, cache: "no-store" },
  );

  return (
    <div className="space-y-6">
      <div>
        <H1>Manage Scores</H1>
        <Muted className="mt-1">Click a week to view matchups and enter scores.</Muted>
      </div>

      <div className="divide-y divide-border rounded-lg border border-border">
        {weeks.map((week, idx) => {
          const pill = statusPill(week);
          return (
            <Link
              key={week.weekId}
              href={`/commissioner/scores/${week.weekId}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="flex items-center gap-3">
                {/* First row (index 0) is most recent — emphasize it as the default focus */}
                <span className={idx === 0 ? "text-sm font-bold" : "text-sm font-medium"}>
                  Week {week.weekNumber}
                </span>
                <span className="text-sm text-muted-foreground">{formatDate(week.startDate)}</span>
                <Badge variant="secondary" className="text-xs">{week.type}</Badge>
                <Badge variant="outline" className="text-xs">{nineLabel(week.nine)}</Badge>
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

        {weeks.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            No weeks scheduled for this season yet.
          </p>
        )}
      </div>
    </div>
  );
}

import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { resolveLeagueContext } from "@/lib/leagueContext";
import { getAccessToken } from "@/lib/auth";
import { fetchSetupStatus, fetchSetupComplete } from "@/lib/commissioner";
import { apiFetch } from "@/lib/api";
import type { SeasonSetupStatus } from "@/lib/commissioner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LeagueHeader } from "@/components/dashboard/LeagueHeader";
import { MatchupWidget } from "./widgets/MatchupWidget";
import type { MatchupSummary } from "./widgets/MatchupWidget";
import { UpcomingMatchupWidget } from "./widgets/UpcomingMatchupWidget";

const TAB_MAP: Record<string, string> = {
  Roster: "roster",
  Teams: "teams",
  Schedule: "schedule",
};

function SetupWidget({ status }: { status: SeasonSetupStatus }) {
  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-amber-600" />
          <CardTitle className="text-base text-amber-800 dark:text-amber-200">
            Season setup required
          </CardTitle>
        </div>
        <CardDescription className="text-amber-700 dark:text-amber-300">
          Complete these steps before the season is live for all members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {status.requirements.map((req) => (
            <li key={req.name} className="flex items-start gap-2 text-sm">
              {req.isMet ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
              ) : (
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
              )}
              <span className={req.isMet ? "text-muted-foreground line-through" : "text-amber-800 dark:text-amber-200"}>
                <span className="font-medium">{req.name}:</span> {req.detail}
                {!req.isMet && (
                  <>
                    {" "}
                    <Link
                      href={`/commissioner/season?tab=${TAB_MAP[req.name] ?? "roster"}`}
                      className={cn(
                        buttonVariants({ variant: "link", size: "sm" }),
                        "h-auto p-0 text-amber-700 dark:text-amber-300"
                      )}
                    >
                      Fix →
                    </Link>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

async function fetchMatchupSummary(
  membershipId: string,
  token: string,
): Promise<MatchupSummary | null> {
  try {
    return await apiFetch<MatchupSummary>("/season/my-matchup-summary", {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Membership-Id": membershipId,
      },
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  await connection();

  const ctx = await resolveLeagueContext();
  if (!ctx) redirect("/login");

  if (ctx.status === "no_leagues") redirect("/me");
  if (ctx.status === "pick_required") redirect("/pick-league");

  const { leagueName, seasonYear, isCommissioner, leagueMembershipId } = ctx.context;
  const token = await getAccessToken();

  if (isCommissioner) {
    const status = await fetchSetupStatus(leagueMembershipId, token);

    if (!status.isComplete) {
      return (
        <div className="space-y-6">
          <LeagueHeader leagueName={leagueName} seasonYear={seasonYear} isCommissioner={isCommissioner} />
          <SetupWidget status={status} />
        </div>
      );
    }

    const summary = await fetchMatchupSummary(leagueMembershipId, token);

    return (
      <div className="space-y-6">
        <LeagueHeader leagueName={leagueName} seasonYear={seasonYear} isCommissioner={isCommissioner} />
        <UpcomingMatchupWidget membershipId={leagueMembershipId} token={token} />
        {summary && <MatchupWidget summary={summary} />}
      </div>
    );
  }

  // Non-commissioner: check if setup is complete
  const isComplete = await fetchSetupComplete(leagueMembershipId, token);

  if (!isComplete) {
    return (
      <div className="space-y-6">
        <LeagueHeader leagueName={leagueName} seasonYear={seasonYear} isCommissioner={isCommissioner}>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your league isn&apos;t ready yet. The commissioner is still setting up this season.
            </p>
          </CardContent>
        </LeagueHeader>
      </div>
    );
  }

  const summary = await fetchMatchupSummary(leagueMembershipId, token);

  return (
    <div className="space-y-6">
      <LeagueHeader leagueName={leagueName} seasonYear={seasonYear} isCommissioner={isCommissioner} />
      <UpcomingMatchupWidget membershipId={leagueMembershipId} token={token} />
      {summary && <MatchupWidget summary={summary} />}
    </div>
  );
}

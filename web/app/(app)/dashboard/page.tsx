import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { resolveLeagueContext } from "@/lib/leagueContext";
import { getAccessToken } from "@/lib/auth";
import { fetchSetupStatus, fetchSetupComplete } from "@/lib/commissioner";
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
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">{leagueName}</CardTitle>
                <Badge>Commissioner</Badge>
              </div>
              <CardDescription>Season {seasonYear}</CardDescription>
            </CardHeader>
          </Card>
          <SetupWidget status={status} />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl">{leagueName}</CardTitle>
              <Badge>Commissioner</Badge>
            </div>
            <CardDescription>Season {seasonYear}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Non-commissioner: check if setup is complete
  const isComplete = await fetchSetupComplete(leagueMembershipId, token);

  if (!isComplete) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{leagueName}</CardTitle>
            <CardDescription>Season {seasonYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your league isn&apos;t ready yet. The commissioner is still setting up this season.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{leagueName}</CardTitle>
          <CardDescription>Season {seasonYear}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

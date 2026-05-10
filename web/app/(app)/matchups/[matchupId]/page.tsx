import { redirect } from "next/navigation";
import { connection } from "next/server";
import { resolveLeagueContext } from "@/lib/leagueContext";
import { getAccessToken } from "@/lib/auth";
import { apiFetchAuthenticated } from "@/lib/api";
import { ScorecardView } from "@/components/scorecard/ScorecardView";
import type { ScorecardData } from "@/components/scorecard/ScorecardView";

export default async function MatchupScorecardPage({
  params,
}: {
  params: Promise<{ matchupId: string }>;
}) {
  await connection();

  const ctx = await resolveLeagueContext();
  if (!ctx) redirect("/login");
  if (ctx.status !== "resolved") redirect("/dashboard");

  const { matchupId } = await params;
  const token = await getAccessToken();
  const { leagueMembershipId: membershipId, isCommissioner, seasonId } = ctx.context;

  const scorecard = await apiFetchAuthenticated<ScorecardData>(
    `/matchups/${matchupId}/scorecard`,
    token,
    { headers: { "X-Membership-Id": membershipId } },
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {scorecard.teamA.name} vs {scorecard.teamB.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Week {scorecard.weekNumber} ·{" "}
          {new Date(scorecard.startDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <ScorecardView
        scorecard={scorecard}
        seasonId={seasonId}
        membershipId={membershipId}
        token={token}
        isCommissioner={isCommissioner}
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { resolveLeagueContext } from "@/lib/leagueContext";
import { getAccessToken } from "@/lib/auth";
import { apiFetchAuthenticated } from "@/lib/api";
import { MatchupsClient } from "./MatchupsClient";

interface Week {
  id: string;
  weekNumber: number;
  startDate: string;
  type: string;
}

interface Team {
  teamId: string;
  name: string;
  members: { leagueMembershipId: string; firstName: string; lastName: string }[];
}

export default async function MatchupsPage({
  searchParams,
}: {
  searchParams: Promise<{ weekId?: string }>;
}) {
  await connection();

  const ctx = await resolveLeagueContext();
  if (!ctx) redirect("/login");
  if (ctx.status !== "resolved" || !ctx.context.isCommissioner) {
    redirect("/dashboard");
  }

  const token = await getAccessToken();
  const { leagueMembershipId: membershipId } = ctx.context;
  const headers = { "X-Membership-Id": membershipId };

  const [weeks, teamsData] = await Promise.all([
    apiFetchAuthenticated<Week[]>("/commissioner/season/schedule", token, { headers }),
    apiFetchAuthenticated<{ teams: Team[] }>("/commissioner/season/teams", token, { headers }),
  ]);

  const { weekId } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Matchups</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ctx.context.leagueName} · {ctx.context.seasonYear}
        </p>
      </div>

      <MatchupsClient
        weeks={weeks}
        teams={teamsData.teams}
        membershipId={membershipId}
        token={token}
        initialWeekId={weekId}
      />
    </div>
  );
}

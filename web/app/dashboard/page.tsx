import { connection } from "next/server";
import { redirect } from "next/navigation";
import { resolveLeagueContext } from "@/lib/leagueContext";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  await connection();

  const ctx = await resolveLeagueContext();
  if (!ctx) redirect("/login");

  if (ctx.status === "no_leagues") redirect("/me");
  if (ctx.status === "pick_required") redirect("/pick-league");

  const { leagueName, seasonYear, isCommissioner } = ctx.context;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle className="text-2xl">{leagueName}</CardTitle>
            {isCommissioner && <Badge>Commissioner</Badge>}
          </div>
          <CardDescription>Season {seasonYear}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

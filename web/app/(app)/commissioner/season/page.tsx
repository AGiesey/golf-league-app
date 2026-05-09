import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { resolveLeagueContext } from "@/lib/leagueContext";
import { getAccessToken } from "@/lib/auth";
import { fetchSetupStatus } from "@/lib/commissioner";
import type { SeasonSetupStatus } from "@/lib/commissioner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SeasonTabs } from "./SeasonTabs";

function StatusBanner({ status }: { status: SeasonSetupStatus }) {
  if (status.isComplete) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-green-600" />
            <CardTitle className="text-base text-green-800 dark:text-green-200">
              Season setup complete
            </CardTitle>
          </div>
        </CardHeader>
      </Card>
    );
  }

  const unmet = status.requirements.filter((r) => !r.isMet);

  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-amber-600" />
          <CardTitle className="text-base text-amber-800 dark:text-amber-200">
            Season setup incomplete
          </CardTitle>
        </div>
        <CardDescription className="text-amber-700 dark:text-amber-300">
          Complete the following to make the season active for all members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {unmet.map((req) => (
            <li key={req.name} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <span>
                <span className="font-medium">{req.name}:</span> {req.detail}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

const VALID_TABS = ["roster", "teams", "schedule"] as const;
type TabKey = (typeof VALID_TABS)[number];

export default async function CommissionerSeasonPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await connection();

  const ctx = await resolveLeagueContext();
  if (!ctx) redirect("/login");
  if (ctx.status !== "resolved" || !ctx.context.isCommissioner) {
    redirect("/dashboard");
  }

  const token = await getAccessToken();
  const status = await fetchSetupStatus(ctx.context.leagueMembershipId, token);

  const { tab } = await searchParams;
  const activeTab: TabKey = VALID_TABS.includes(tab as TabKey)
    ? (tab as TabKey)
    : "roster";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Season Setup</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ctx.context.leagueName} · {ctx.context.seasonYear}
        </p>
      </div>

      <StatusBanner status={status} />

      <div>
        <Link
          href="/commissioner/matchups"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Manage Matchups →
        </Link>
      </div>

      <SeasonTabs
        status={status}
        activeTab={activeTab}
        membershipId={ctx.context.leagueMembershipId}
        token={token}
      />
    </div>
  );
}

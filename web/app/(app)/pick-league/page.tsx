import { connection } from "next/server";
import { redirect } from "next/navigation";
import { resolveLeagueContextRaw } from "@/lib/leagueContext";
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

export default async function PickLeaguePage() {
  await connection();

  const ctx = await resolveLeagueContextRaw();
  if (!ctx) redirect("/login");

  if (ctx.status === "no_leagues") redirect("/me");
  if (ctx.status === "resolved") redirect("/dashboard");

  const { memberships } = ctx;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Select a League</CardTitle>
          <CardDescription>
            You have memberships in multiple leagues. Pick one to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {memberships.map((m) => (
              <li key={m.id}>
                <form method="POST" action="/api/context/select">
                  <input type="hidden" name="membershipId" value={m.id} />
                  <button
                    type="submit"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full justify-between"
                    )}
                  >
                    <span>{m.leagueName}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{m.seasonYear}</Badge>
                      {m.isCommissioner && <Badge>Commissioner</Badge>}
                    </div>
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

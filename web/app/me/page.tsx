import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/auth";
import { apiFetchAuthenticated, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

interface Membership {
  leagueName: string;
  seasonYear: number;
}

interface MeResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  course: { name: string };
  memberships: Membership[];
}

export default async function MePage() {
  await connection();

  const token = await getAccessToken().catch(() => null);
  if (!token) redirect("/login");

  try {
    const golfer = await apiFetchAuthenticated<MeResponse>("/me", token, {
      cache: "no-store",
    });

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {golfer.firstName} {golfer.lastName}
            </CardTitle>
            <CardDescription>{golfer.course.name}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>League Memberships</CardTitle>
          </CardHeader>
          <CardContent>
            {golfer.memberships.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No active memberships.
              </p>
            ) : (
              <ul className="space-y-2">
                {golfer.memberships.map((m, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>{m.leagueName}</span>
                    <Badge variant="secondary">{m.seasonYear}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <a
          href="/api/auth/logout"
          className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
        >
          Log out
        </a>
      </div>
    );
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) redirect("/login");

      if (err.status === 403) {
        let email = "";
        try {
          const body = JSON.parse(err.body) as { email?: string };
          email = body.email ?? "";
        } catch {
          // ignore parse error
        }
        return (
          <div>
            <p>
              Account not registered at this course — contact your commissioner.
              {email && ` (${email})`}
            </p>
          </div>
        );
      }
    }
    redirect("/login");
  }
}

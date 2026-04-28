import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/auth";
import { apiFetchAuthenticated, ApiError } from "@/lib/api";

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
      <main>
        <h1>
          {golfer.firstName} {golfer.lastName}
        </h1>
        <p>{golfer.course.name}</p>
        <h2>League Memberships</h2>
        {golfer.memberships.length === 0 ? (
          <p>No active memberships.</p>
        ) : (
          <ul>
            {golfer.memberships.map((m, i) => (
              <li key={i}>
                {m.leagueName} — {m.seasonYear}
              </li>
            ))}
          </ul>
        )}
        <a href="/api/auth/logout">Log out</a>
      </main>
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
          <main>
            <p>
              Account not registered at this course — contact your commissioner.
              {email && ` (${email})`}
            </p>
          </main>
        );
      }
    }
    redirect("/login");
  }
}

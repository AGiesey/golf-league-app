import { connection } from "next/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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

const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export default async function MePage() {
  await connection();

  const cookieStore = await cookies();
  const mockGolferId = cookieStore.get("mock-golfer-id")?.value;

  const res = await fetch(`${API_URL}/me`, {
    cache: "no-store",
    headers: mockGolferId
      ? { Cookie: `mock-golfer-id=${mockGolferId}` }
      : {},
  });

  if (res.status === 401) {
    redirect("/dev/login");
  }

  const golfer: MeResponse = await res.json();

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
    </main>
  );
}

import { cookies } from "next/headers";

const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export async function POST(request: Request) {
  const body = await request.json();

  const apiRes = await fetch(`${API_URL}/dev/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!apiRes.ok) {
    return new Response(null, { status: apiRes.status });
  }

  const cookieStore = await cookies();
  cookieStore.set("mock-golfer-id", body.golferId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return new Response(null, { status: 200 });
}

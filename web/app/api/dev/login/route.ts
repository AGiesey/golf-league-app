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

  const { token } = (await apiRes.json()) as { token: string };

  const cookieStore = await cookies();
  cookieStore.set("app-token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return new Response(null, { status: 200 });
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";
import { apiFetchAuthenticated } from "@/lib/api";
import type { ContextResponse } from "@/lib/leagueContext";

const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  const token = await getAccessToken().catch(() => null);
  if (!token) {
    return NextResponse.redirect(new URL("/login", baseUrl));
  }

  const formData = await request.formData();
  const membershipId = formData.get("membershipId");

  if (!membershipId || typeof membershipId !== "string") {
    return NextResponse.redirect(new URL("/pick-league", baseUrl));
  }

  const result = await apiFetchAuthenticated<ContextResponse>(
    `/context?membershipId=${membershipId}`,
    token,
    { cache: "no-store" }
  ).catch(() => null);

  if (!result || result.status !== "resolved") {
    return NextResponse.redirect(new URL("/pick-league", baseUrl));
  }

  const cookieStore = await cookies();
  cookieStore.set("active_membership_id", membershipId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.redirect(new URL("/dashboard", baseUrl));
}

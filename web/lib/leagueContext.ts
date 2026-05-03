import { cookies } from "next/headers";
import { getAccessToken } from "./auth";
import { apiFetchAuthenticated } from "./api";

export interface LeagueContext {
  golferId: string;
  leagueMembershipId: string;
  seasonId: string;
  leagueId: string;
  courseId: string;
  isCommissioner: boolean;
  leagueName: string;
  seasonYear: number;
}

export interface PickerMembership {
  id: string;
  leagueName: string;
  seasonYear: number;
  isCommissioner: boolean;
}

export type ContextResponse =
  | { status: "resolved"; context: LeagueContext }
  | { status: "pick_required"; memberships: PickerMembership[] }
  | { status: "no_leagues" };

// Resolves league context for the current request, passing the active_membership_id
// cookie as a hint. Returns null if the user is unauthenticated.
export async function resolveLeagueContext(): Promise<ContextResponse | null> {
  const token = await getAccessToken().catch(() => null);
  if (!token) return null;

  const cookieStore = await cookies();
  const membershipId = cookieStore.get("active_membership_id")?.value;

  const path = membershipId
    ? `/context?membershipId=${membershipId}`
    : "/context";

  return apiFetchAuthenticated<ContextResponse>(path, token, {
    cache: "no-store",
  });
}

// Resolves league context without any membership hint — used by the picker page
// to always get the raw candidate list.
export async function resolveLeagueContextRaw(): Promise<ContextResponse | null> {
  const token = await getAccessToken().catch(() => null);
  if (!token) return null;

  return apiFetchAuthenticated<ContextResponse>("/context", token, {
    cache: "no-store",
  });
}

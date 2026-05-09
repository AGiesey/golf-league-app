import { apiFetch } from "./api";

export interface SetupRequirement {
  name: string;
  isMet: boolean;
  detail: string;
}

export interface SeasonSetupStatus {
  isComplete: boolean;
  requirements: SetupRequirement[];
}

export async function fetchSetupStatus(
  membershipId: string,
  token: string,
): Promise<SeasonSetupStatus> {
  return apiFetch<SeasonSetupStatus>("/commissioner/season/setup-status", {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Membership-Id": membershipId,
    },
    cache: "no-store",
  });
}

export async function fetchSetupComplete(
  membershipId: string,
  token: string,
): Promise<boolean> {
  const result = await apiFetch<{ isComplete: boolean }>("/season/setup-status", {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Membership-Id": membershipId,
    },
    cache: "no-store",
  });
  return result.isComplete;
}

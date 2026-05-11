import { Shell } from "@/components/layout/Shell";
import { resolveLeagueContext } from "@/lib/leagueContext";
import { getAccessToken } from "@/lib/auth";
import { apiFetchAuthenticated } from "@/lib/api";

interface MeResponse {
  firstName: string;
  lastName: string;
}

async function resolveGolferName(): Promise<string> {
  try {
    const token = await getAccessToken();
    const golfer = await apiFetchAuthenticated<MeResponse>("/me", token, {
      cache: "no-store",
    });
    return `${golfer.firstName} ${golfer.lastName}`.trim();
  } catch {
    return "";
  }
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ctx, golferName] = await Promise.all([
    resolveLeagueContext().catch(() => null),
    resolveGolferName(),
  ]);
  const isCommissioner =
    ctx?.status === "resolved" ? ctx.context.isCommissioner : false;

  return (
    <Shell isCommissioner={isCommissioner} golferName={golferName}>
      {children}
    </Shell>
  );
}

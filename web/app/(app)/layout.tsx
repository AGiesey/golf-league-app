import { Shell } from "@/components/layout/Shell";
import { resolveLeagueContext } from "@/lib/leagueContext";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await resolveLeagueContext().catch(() => null);
  const isCommissioner =
    ctx?.status === "resolved" ? ctx.context.isCommissioner : false;

  return <Shell isCommissioner={isCommissioner}>{children}</Shell>;
}

"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { SeasonSetupStatus } from "@/lib/commissioner";
import { RosterTable } from "./RosterTable";

const TAB_KEYS = ["roster", "teams", "schedule"] as const;
type TabKey = (typeof TAB_KEYS)[number];

const TAB_LABELS: Record<TabKey, string> = {
  roster: "Roster",
  teams: "Teams",
  schedule: "Schedule",
};

interface SeasonTabsProps {
  status: SeasonSetupStatus;
  activeTab: TabKey;
  membershipId: string;
  token: string;
}

export function SeasonTabs({ status, activeTab, membershipId, token }: SeasonTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const requirementByTab: Record<TabKey, (typeof status.requirements)[number] | undefined> = {
    roster: status.requirements.find((r) => r.name === "Roster"),
    teams: status.requirements.find((r) => r.name === "Teams"),
    schedule: status.requirements.find((r) => r.name === "Schedule"),
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => router.replace(`${pathname}?tab=${v}`)}
    >
      <TabsList>
        {TAB_KEYS.map((key) => {
          const req = requirementByTab[key];
          return (
            <TabsTrigger key={key} value={key}>
              {req?.isMet ? (
                <CheckCircle2 className="size-4 text-green-600" />
              ) : (
                <AlertTriangle className="size-4 text-amber-500" />
              )}
              {TAB_LABELS[key]}
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="roster" className="pt-6">
        <RosterTable membershipId={membershipId} token={token} />
      </TabsContent>
      <TabsContent value="teams" className="pt-6">
        <p className="text-sm text-muted-foreground">
          Team formation is not yet available.
        </p>
      </TabsContent>
      <TabsContent value="schedule" className="pt-6">
        <p className="text-sm text-muted-foreground">
          Schedule generation is not yet available.
        </p>
      </TabsContent>
    </Tabs>
  );
}

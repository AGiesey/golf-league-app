"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scorecard } from "./Scorecard";
import type { HoleInfo, SlotScore } from "./Scorecard";

interface ScorecardPanelProps {
  holes: HoleInfo[];
  slotScores: SlotScore[];
  label?: string;
  entryButton?: (slot: SlotScore) => React.ReactNode;
}

export function ScorecardPanel({ holes, slotScores, label, entryButton }: ScorecardPanelProps) {
  return (
    <Card>
      {label && (
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{label}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={label ? "pt-0" : undefined}>
        <Scorecard holes={holes} slots={slotScores} entryButton={entryButton} />
      </CardContent>
    </Card>
  );
}

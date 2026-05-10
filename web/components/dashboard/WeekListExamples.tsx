"use client";

import { Badge } from "@/components/ui/badge";
import { H3 } from "@/components/typography";

interface WeekRow {
  weekId: string;
  weekNumber: number;
  date: string;
  type: string;
  nine: string;
  slotCount: number;
  roundCount: number;
}

function nineLabel(nine: string) {
  if (nine === "Front") return "Front 9";
  if (nine === "Back") return "Back 9";
  return "18 holes";
}

function statusPill(slotCount: number, roundCount: number) {
  if (slotCount === 0) return { label: "No matchups", variant: "secondary" as const, className: "" };
  if (roundCount === 0) return { label: "Not started", variant: "outline" as const, className: "" };
  if (roundCount < slotCount) return { label: "Partial", variant: "default" as const, className: "bg-warning-500 text-white hover:bg-warning-500" };
  return { label: "Complete", variant: "default" as const, className: "bg-success-500 text-white hover:bg-success-500" };
}

function WeekList({ weeks }: { weeks: WeekRow[] }) {
  return (
    <div className="divide-y divide-border rounded-lg border border-border max-w-2xl">
      {weeks.map((week, idx) => {
        const pill = statusPill(week.slotCount, week.roundCount);
        return (
          <div key={week.weekId} className="flex items-center justify-between px-4 py-3 first:rounded-t-lg last:rounded-b-lg hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <span className={idx === 0 ? "text-sm font-bold" : "text-sm font-medium"}>Week {week.weekNumber}</span>
              <span className="text-sm text-muted-foreground">{week.date}</span>
              <Badge variant="secondary" className="text-xs">{week.type}</Badge>
              <Badge variant="outline" className="text-xs">{nineLabel(week.nine)}</Badge>
            </div>
            <Badge variant={pill.variant} className={pill.className}>{pill.label}</Badge>
          </div>
        );
      })}
    </div>
  );
}

const ALL_NOT_STARTED: WeekRow[] = [
  { weekId: "w1", weekNumber: 3, date: "Jun 18", type: "Regular", nine: "Front", slotCount: 8, roundCount: 0 },
  { weekId: "w2", weekNumber: 2, date: "Jun 11", type: "Regular", nine: "Back", slotCount: 8, roundCount: 0 },
  { weekId: "w3", weekNumber: 1, date: "Jun 4", type: "FunWeek", nine: "Front", slotCount: 8, roundCount: 0 },
];

const MIXED: WeekRow[] = [
  { weekId: "w4", weekNumber: 3, date: "Jun 18", type: "Regular", nine: "Front", slotCount: 8, roundCount: 3 },
  { weekId: "w5", weekNumber: 2, date: "Jun 11", type: "Regular", nine: "Back", slotCount: 8, roundCount: 8 },
  { weekId: "w6", weekNumber: 1, date: "Jun 4", type: "FunWeek", nine: "Front", slotCount: 0, roundCount: 0 },
];

const ALL_COMPLETE: WeekRow[] = [
  { weekId: "w7", weekNumber: 3, date: "Jun 18", type: "Regular", nine: "Front", slotCount: 8, roundCount: 8 },
  { weekId: "w8", weekNumber: 2, date: "Jun 11", type: "Regular", nine: "Back", slotCount: 8, roundCount: 8 },
  { weekId: "w9", weekNumber: 1, date: "Jun 4", type: "MakeupDay", nine: "Full", slotCount: 4, roundCount: 4 },
];

export function WeekListExamples() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <H3>All not started</H3>
        <WeekList weeks={ALL_NOT_STARTED} />
      </div>
      <div className="space-y-2">
        <H3>Mixed statuses</H3>
        <WeekList weeks={MIXED} />
      </div>
      <div className="space-y-2">
        <H3>All complete</H3>
        <WeekList weeks={ALL_COMPLETE} />
      </div>
    </div>
  );
}

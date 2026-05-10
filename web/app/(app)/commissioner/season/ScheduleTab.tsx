"use client";

import { useState, useEffect } from "react";
import { apiFetchAuthenticated } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

interface Week {
  id: string;
  weekNumber: number;
  startDate: string;
  type: string;
  nine: string;
}

interface ScheduleTabProps {
  membershipId: string;
  token: string;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatSide(nine: string): string {
  switch (nine) {
    case "Back": return "Back 9";
    case "Full": return "Full 18";
    default: return "Front 9";
  }
}

function formatType(type: string): string {
  switch (type) {
    case "FunWeek": return "Fun Week";
    case "MakeupDay": return "Makeup Day";
    default: return "Regular";
  }
}

export function ScheduleTab({ membershipId, token }: ScheduleTabProps) {
  const [weeks, setWeeks] = useState<Week[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetchAuthenticated<Week[]>("/commissioner/season/schedule", token, {
      headers: { "X-Membership-Id": membershipId },
    })
      .then(setWeeks)
      .catch(() => setError("Failed to load schedule."));
  }, [membershipId, token]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!weeks) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (weeks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Your schedule hasn&apos;t been set up yet.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Contact your course admin to get your weeks added.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left">
          <th className="pb-2 pr-6 font-medium">Week</th>
          <th className="pb-2 pr-6 font-medium">Date</th>
          <th className="pb-2 pr-6 font-medium">Side</th>
          <th className="pb-2 font-medium">Type</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {weeks.map((week) => (
          <tr key={week.id}>
            <td className="py-2 pr-6 tabular-nums">{week.weekNumber}</td>
            <td className="py-2 pr-6">{formatDate(week.startDate)}</td>
            <td className="py-2 pr-6 text-muted-foreground">{formatSide(week.nine)}</td>
            <td className="py-2 text-muted-foreground">{formatType(week.type)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

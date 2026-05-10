"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { PairingHistoryEntry } from "./MatchupsClient";

interface Team {
  teamId: string;
  name: string;
}

interface PairingHistoryMatrixProps {
  teams: Team[];
  history: PairingHistoryEntry[];
}

export function PairingHistoryMatrix({ teams, history }: PairingHistoryMatrixProps) {
  const [isOpen, setIsOpen] = useState(false);

  // O(1) lookup: canonical pair key "smaller-larger" → count
  const lookup = new Map<string, number>();
  for (const entry of history) {
    const [a, b] = [entry.teamAId, entry.teamBId].sort();
    lookup.set(`${a}-${b}`, entry.count);
  }

  function getCount(rowId: string, colId: string): number | null {
    if (rowId === colId) return null;
    const [a, b] = [rowId, colId].sort();
    return lookup.get(`${a}-${b}`) ?? 0;
  }

  return (
    <div className="rounded border border-border">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-muted/50"
      >
        {isOpen ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}
        Matchup History
        <span className="ml-auto text-xs font-normal text-muted-foreground">
          prior regular weeks
        </span>
      </button>

      {isOpen && (
        <div className="overflow-x-auto border-t border-border p-4">
          <table className="min-w-full text-xs">
            <thead>
              <tr>
                <th className="w-24 pb-2 pr-3 text-left font-medium text-muted-foreground" />
                {teams.map((col) => (
                  <th
                    key={col.teamId}
                    className="pb-2 pl-2 pr-2 text-center font-medium text-muted-foreground"
                    title={col.name}
                  >
                    <span className="inline-block max-w-16 truncate">{col.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teams.map((row) => (
                <tr key={row.teamId} className="border-t border-border/50">
                  <td
                    className="py-1.5 pr-3 font-medium text-muted-foreground"
                    title={row.name}
                  >
                    <span className="inline-block max-w-24 truncate">{row.name}</span>
                  </td>
                  {teams.map((col) => {
                    const count = getCount(row.teamId, col.teamId);
                    return (
                      <td
                        key={col.teamId}
                        className="py-1.5 pl-2 pr-2 text-center tabular-nums"
                      >
                        {count === null ? (
                          <span className="text-muted-foreground/30">·</span>
                        ) : count === 0 ? (
                          <span className="text-muted-foreground/50">—</span>
                        ) : (
                          <span className="font-semibold">{count}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

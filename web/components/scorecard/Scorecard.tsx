import { cn } from "@/lib/utils";

export interface HoleInfo {
  id: string;
  number: number;
  par: number;
  handicapIndex: number;
}

export interface SlotScore {
  slotId: string;
  playerName: string;
  isSubstitute: boolean;
  holeScores: (number | null)[];
  roundId: string | null;
}

interface ScorecardProps {
  holes: HoleInfo[];
  slots: SlotScore[];
  entryButton?: (slot: SlotScore) => React.ReactNode;
}

export function Scorecard({ holes, slots, entryButton }: ScorecardProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="pb-2 pr-4 text-left font-medium text-muted-foreground w-36">
              Player
            </th>
            {holes.map((h) => (
              <th
                key={h.id}
                className="pb-2 px-1.5 text-center font-medium text-muted-foreground w-10"
              >
                {h.number}
              </th>
            ))}
            {entryButton && <th className="pb-2 pl-3 w-24" />}
          </tr>
          <tr className="border-b text-xs text-muted-foreground">
            <td className="py-1 pr-4">Par</td>
            {holes.map((h) => (
              <td key={h.id} className="py-1 px-1.5 text-center">
                {h.par}
              </td>
            ))}
            {entryButton && <td />}
          </tr>
          <tr className="border-b text-xs text-muted-foreground">
            <td className="py-1 pr-4">Hdcp</td>
            {holes.map((h) => (
              <td key={h.id} className="py-1 px-1.5 text-center">
                {h.handicapIndex}
              </td>
            ))}
            {entryButton && <td />}
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => (
            <tr key={slot.slotId} className="border-b last:border-0">
              <td className="py-2 pr-4 font-medium">
                <span>{slot.playerName}</span>
                {slot.isSubstitute && (
                  <span className="ml-1.5 text-xs text-muted-foreground">(sub)</span>
                )}
              </td>
              {slot.holeScores.map((strokes, i) => (
                <td
                  key={i}
                  className={cn(
                    "py-2 px-1.5 text-center tabular-nums",
                    strokes === null && "text-muted-foreground",
                  )}
                >
                  {strokes ?? "—"}
                </td>
              ))}
              {entryButton && (
                <td className="py-2 pl-3">{entryButton(slot)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

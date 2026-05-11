"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScorecardPanel } from "./ScorecardPanel";
import { ScoreEntryDialog } from "./ScoreEntryDialog";
import type { HoleInfo, SlotScore } from "./Scorecard";
import type { Sub } from "./SubPickerInline";

interface TeeBox {
  id: string;
  name: string;
}

interface Slot {
  slotId: string;
  leagueMembership: {
    id: string;
    firstName: string;
    lastName: string;
    handicap: number | null;
  };
  round: {
    roundId: string;
    teeBox: { id: string; name: string };
    sub: Sub | null;
    holeScores: { strokes: number | null }[];
  } | null;
}

interface Pairing {
  pairingId: string;
  teeTime: string | null;
  slots: Slot[];
}

export interface ScorecardData {
  matchupId: string;
  weekNumber: number;
  nine: string;
  startDate: string;
  teamA: { teamId: string; name: string };
  teamB: { teamId: string; name: string };
  holes: HoleInfo[];
  teeBoxes: TeeBox[];
  defaultTeeBoxId: string | null;
  pairing: Pairing | null;
}

interface ActiveDialog {
  mode: "create" | "edit";
  slot: Slot;
  holes: HoleInfo[];
  scoreOffset: number;
}

function buildSlotScores(slots: Slot[], holes: HoleInfo[], scoreOffset: number): SlotScore[] {
  return slots.map((slot) => {
    const round = slot.round;
    const sub = round?.sub ?? null;
    return {
      slotId: slot.slotId,
      playerName: sub
        ? `${sub.firstName} ${sub.lastName}`
        : `${slot.leagueMembership.firstName} ${slot.leagueMembership.lastName}`,
      isSubstitute: sub !== null,
      holeScores: round
        ? holes.map((_, i) => round.holeScores[scoreOffset + i]?.strokes ?? null)
        : holes.map(() => null),
      roundId: round?.roundId ?? null,
    };
  });
}

interface ScorecardViewProps {
  scorecard: ScorecardData;
  seasonId: string;
  membershipId: string;
  token: string;
  isCommissioner: boolean;
  backWeekId?: string;
}

export function ScorecardView({
  scorecard,
  seasonId,
  membershipId,
  token,
  isCommissioner,
  backWeekId,
}: ScorecardViewProps) {
  const router = useRouter();
  const [dialog, setDialog] = useState<ActiveDialog | null>(null);
  const [knownSubs, setKnownSubs] = useState<Sub[]>([]);

  const { holes, pairing, teeBoxes, defaultTeeBoxId, nine } = scorecard;
  const slots = pairing?.slots ?? [];

  const isFullEighteen = nine === "Full";
  const frontHoles = isFullEighteen ? holes.filter((h) => h.number <= 9) : holes;
  const backHoles = isFullEighteen ? holes.filter((h) => h.number > 9) : null;
  const frontOffset = 0;
  const backOffset = isFullEighteen ? frontHoles.length : 0;

  const userHasSlot = slots.some((s) => s.leagueMembership.id === membershipId);
  const showEntryButton = isCommissioner || userHasSlot;

  function makeEntryButton(slot: SlotScore, holeSet: HoleInfo[], scoreOffset: number) {
    const apiSlot = pairing?.slots.find((s) => s.slotId === slot.slotId);
    if (!apiSlot) return null;
    if (!isCommissioner && apiSlot.leagueMembership.id !== membershipId) return null;

    if (slot.roundId) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setDialog({ mode: "edit", slot: apiSlot, holes: holeSet, scoreOffset })
          }
        >
          Edit
        </Button>
      );
    }
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          setDialog({ mode: "create", slot: apiSlot, holes: holeSet, scoreOffset })
        }
      >
        Add scores
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      {backWeekId && (
        <Link
          href={`/commissioner/scores/${backWeekId}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to week
        </Link>
      )}

      {pairing === null && (
        <p className="text-sm text-muted-foreground">
          No pairing has been created for this matchup yet.
        </p>
      )}

      {isFullEighteen ? (
        <>
          <ScorecardPanel
            holes={frontHoles}
            slotScores={buildSlotScores(slots, frontHoles, frontOffset)}
            label="Front 9"
            entryButton={showEntryButton ? (s) => makeEntryButton(s, frontHoles, frontOffset) : undefined}
          />
          {backHoles && (
            <ScorecardPanel
              holes={backHoles}
              slotScores={buildSlotScores(slots, backHoles, backOffset)}
              label="Back 9"
              entryButton={showEntryButton ? (s) => makeEntryButton(s, backHoles, backOffset) : undefined}
            />
          )}
        </>
      ) : (
        <ScorecardPanel
          holes={frontHoles}
          slotScores={buildSlotScores(slots, frontHoles, frontOffset)}
          entryButton={showEntryButton ? (s) => makeEntryButton(s, frontHoles, frontOffset) : undefined}
        />
      )}

      {dialog && (
        <ScoreEntryDialog
          open
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            router.refresh();
          }}
          mode={dialog.mode}
          playerName={`${dialog.slot.leagueMembership.firstName} ${dialog.slot.leagueMembership.lastName}`}
          slotId={dialog.slot.slotId}
          roundId={dialog.slot.round?.roundId ?? null}
          holes={dialog.holes}
          initialScores={
            dialog.slot.round
              ? dialog.holes.map(
                  (_, i) =>
                    dialog.slot.round!.holeScores[dialog.scoreOffset + i]?.strokes ?? null,
                )
              : undefined
          }
          initialTeeBoxId={dialog.slot.round?.teeBox?.id ?? null}
          initialSubId={dialog.slot.round?.sub?.id ?? null}
          teeBoxes={teeBoxes}
          defaultTeeBoxId={defaultTeeBoxId}
          subs={knownSubs}
          seasonId={seasonId}
          membershipId={membershipId}
          token={token}
          onSubCreated={(sub) => setKnownSubs((prev) => [...prev, sub])}
        />
      )}
    </div>
  );
}

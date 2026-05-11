"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScoreEntryDialog } from "./ScoreEntryDialog";
import type { HoleInfo } from "./Scorecard";
import type { Sub } from "./SubPickerInline";

const DESIGN_HOLES: HoleInfo[] = [
  { id: "h1", number: 1, par: 4, handicapIndex: 7 },
  { id: "h2", number: 2, par: 3, handicapIndex: 17 },
  { id: "h3", number: 3, par: 5, handicapIndex: 1 },
  { id: "h4", number: 4, par: 4, handicapIndex: 11 },
  { id: "h5", number: 5, par: 4, handicapIndex: 5 },
  { id: "h6", number: 6, par: 3, handicapIndex: 15 },
  { id: "h7", number: 7, par: 5, handicapIndex: 3 },
  { id: "h8", number: 8, par: 4, handicapIndex: 9 },
  { id: "h9", number: 9, par: 4, handicapIndex: 13 },
];

const DESIGN_TEE_BOXES = [
  { id: "tb-white", name: "White" },
  { id: "tb-blue", name: "Blue" },
  { id: "tb-red", name: "Red" },
];

const DESIGN_SUBS: Sub[] = [
  { id: "sub-1", firstName: "Gary", lastName: "Phelps", handicap: 14.2 },
  { id: "sub-2", firstName: "Tom", lastName: "Walsh", handicap: 22.0 },
];

type DialogKey = "empty" | "filled" | "sub-create";

export function ScoreEntryDialogExamples() {
  const [open, setOpen] = useState<DialogKey | null>(null);

  const sharedProps = {
    holes: DESIGN_HOLES,
    teeBoxes: DESIGN_TEE_BOXES,
    defaultTeeBoxId: "tb-white",
    subs: DESIGN_SUBS,
    seasonId: "season-design",
    membershipId: "member-design",
    token: "",
    playerName: "Jim Harper",
    slotId: "slot-design",
    roundId: null,
    onClose: () => setOpen(null),
    onSaved: () => setOpen(null),
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="outline" onClick={() => setOpen("empty")}>
        Empty form (create)
      </Button>
      <Button variant="outline" onClick={() => setOpen("filled")}>
        Valid form (edit — pre-filled)
      </Button>
      <Button variant="outline" onClick={() => setOpen("sub-create")}>
        Sub create expanded
      </Button>

      <ScoreEntryDialog
        {...sharedProps}
        open={open === "empty"}
        mode="create"
      />

      <ScoreEntryDialog
        {...sharedProps}
        open={open === "filled"}
        mode="edit"
        roundId="round-design"
        initialScores={[4, 3, 5, 4, 5, 3, 6, 4, 4]}
        initialTeeBoxId="tb-blue"
      />

      <ScoreEntryDialog
        {...sharedProps}
        open={open === "sub-create"}
        mode="create"
      />
    </div>
  );
}

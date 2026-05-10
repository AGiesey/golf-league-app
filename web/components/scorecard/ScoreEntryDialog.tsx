"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubPickerInline } from "./SubPickerInline";
import type { Sub } from "./SubPickerInline";
import type { HoleInfo } from "./Scorecard";

interface TeeBox {
  id: string;
  name: string;
}

interface HoleScoreInput {
  holeId: string;
  strokes: number | null;
}

interface ScoreEntryDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  mode: "create" | "edit";
  playerName: string;
  slotId: string;
  roundId: string | null;
  holes: HoleInfo[];
  initialScores?: (number | null)[];
  initialTeeBoxId?: string | null;
  initialSubId?: string | null;
  teeBoxes: TeeBox[];
  defaultTeeBoxId: string | null;
  subs: Sub[];
  seasonId: string;
  membershipId: string;
  token: string;
  onSubCreated?: (sub: Sub) => void;
}

export function ScoreEntryDialog({
  open,
  onClose,
  onSaved,
  mode,
  playerName,
  slotId,
  roundId,
  holes,
  initialScores,
  initialTeeBoxId,
  initialSubId,
  teeBoxes,
  defaultTeeBoxId,
  subs: initialSubs,
  seasonId,
  membershipId,
  token,
  onSubCreated,
}: ScoreEntryDialogProps) {
  const [scores, setScores] = useState<(string | null)[]>(
    holes.map((_, i) => (initialScores?.[i] != null ? String(initialScores[i]) : null)),
  );
  const [teeBoxId, setTeeBoxId] = useState<string>(
    initialTeeBoxId ?? defaultTeeBoxId ?? (teeBoxes[0]?.id ?? ""),
  );
  const [subId, setSubId] = useState<string | null>(initialSubId ?? null);
  const [subs, setSubs] = useState<Sub[]>(initialSubs);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allValid = scores.every((s) => s !== null && s !== "" && parseInt(s) > 0);

  function setScore(index: number, value: string) {
    setScores((prev) => {
      const next = [...prev];
      next[index] = value === "" ? null : value;
      return next;
    });
  }

  async function handleSave() {
    if (!allValid) return;
    setSaving(true);
    setError(null);

    const holeScores: HoleScoreInput[] = holes.map((h, i) => ({
      holeId: h.id,
      strokes: scores[i] ? parseInt(scores[i]!) : null,
    }));

    const body = { teeBoxId, subId, holeScores };
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

    try {
      const url =
        mode === "create"
          ? `${apiBase}/commissioner/pairing-slots/${slotId}/round`
          : `${apiBase}/commissioner/rounds/${roundId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Membership-Id": membershipId,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save scores");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Enter scores" : "Edit scores"} — {playerName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tee box</Label>
            <Select value={teeBoxId} onValueChange={(v) => { if (v !== null) setTeeBoxId(v); }}>
              <SelectTrigger>
                <SelectValue>
                  {(value: string | null) =>
                    value ? (teeBoxes.find((tb) => tb.id === value)?.name ?? value) : "Select tee box…"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {teeBoxes.map((tb) => (
                  <SelectItem key={tb.id} value={tb.id}>
                    {tb.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <SubPickerInline
            subs={subs}
            selectedSubId={subId}
            onSubChange={setSubId}
            membershipId={membershipId}
            token={token}
            seasonId={seasonId}
            onSubCreated={(sub) => {
              setSubs((prev) => [...prev, sub]);
              onSubCreated?.(sub);
            }}
          />

          <div className="space-y-1.5">
            <Label>Hole scores</Label>
            <div className="grid grid-cols-9 gap-1">
              {holes.map((h, i) => (
                <div key={h.id} className="space-y-0.5">
                  <p className="text-center text-xs text-muted-foreground">{h.number}</p>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    className="px-1 text-center tabular-nums"
                    value={scores[i] ?? ""}
                    onChange={(e) => setScore(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!allValid || saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

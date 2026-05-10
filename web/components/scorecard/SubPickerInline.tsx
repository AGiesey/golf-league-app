"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Sub {
  id: string;
  firstName: string;
  lastName: string;
  handicap: number;
}

interface SubPickerInlineProps {
  subs: Sub[];
  selectedSubId: string | null;
  onSubChange: (subId: string | null) => void;
  membershipId: string;
  token: string;
  seasonId: string;
  onSubCreated: (sub: Sub) => void;
}

export function SubPickerInline({
  subs,
  selectedSubId,
  onSubChange,
  membershipId,
  token,
  seasonId,
  onSubCreated,
}: SubPickerInlineProps) {
  const [mode, setMode] = useState<"none" | "existing" | "create">("none");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [handicap, setHandicap] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!firstName.trim() || !lastName.trim() || !handicap) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/commissioner/seasons/${seasonId}/subs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Membership-Id": membershipId,
          },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            handicap: parseFloat(handicap),
          }),
        },
      );
      if (!res.ok) throw new Error("Failed to create sub");
      const newSub: Sub = await res.json();
      onSubCreated(newSub);
      onSubChange(newSub.id);
      setMode("none");
      setFirstName("");
      setLastName("");
      setHandicap("");
    } catch {
      setError("Could not create sub. Try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Sub</Label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "none" ? "none" : "none");
              onSubChange(null);
              setMode("none");
            }}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            No sub
          </button>
          <span className="text-muted-foreground">·</span>
          <button
            type="button"
            onClick={() => setMode("existing")}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Select existing
          </button>
          <span className="text-muted-foreground">·</span>
          <button
            type="button"
            onClick={() => setMode("create")}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Create new
          </button>
        </div>
      </div>

      {mode === "existing" && (
        <Select
          value={selectedSubId ?? ""}
          onValueChange={(v) => onSubChange(v || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a sub…" />
          </SelectTrigger>
          <SelectContent>
            {subs.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.firstName} {s.lastName} (hdcp {s.handicap})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {mode === "create" && (
        <div className="space-y-2 rounded-md border p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">First name</Label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Last name</Label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Handicap</Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              value={handicap}
              onChange={(e) => setHandicap(e.target.value)}
              placeholder="0"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleCreate}
              disabled={creating || !firstName.trim() || !lastName.trim() || !handicap}
            >
              {creating ? "Creating…" : "Create sub"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setMode("none")}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {mode === "none" && selectedSubId && (
        <p className="text-xs text-muted-foreground">
          Sub: {subs.find((s) => s.id === selectedSubId)?.firstName}{" "}
          {subs.find((s) => s.id === selectedSubId)?.lastName}
        </p>
      )}
    </div>
  );
}

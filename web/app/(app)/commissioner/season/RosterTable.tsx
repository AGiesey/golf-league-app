"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { apiFetchAuthenticated } from "@/lib/api";

interface RosterMember {
  leagueMembershipId: string;
  golferId: string;
  firstName: string;
  lastName: string;
  email: string;
  handicap: number | null;
  isCommissioner: boolean;
}

interface HandicapCellProps {
  member: RosterMember;
  membershipId: string;
  token: string;
  onUpdate: (leagueMembershipId: string, handicap: number) => void;
}

function HandicapCell({ member, membershipId, token, onUpdate }: HandicapCellProps) {
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);

  if (member.handicap !== null) {
    return <span>{member.handicap}</span>;
  }

  async function save() {
    const trimmed = inputValue.trim();
    if (trimmed === "") return;
    const parsed = parseFloat(trimmed);
    if (isNaN(parsed)) return;

    setSaving(true);
    try {
      const updated = await apiFetchAuthenticated<RosterMember>(
        `/commissioner/season/roster/${member.leagueMembershipId}/handicap`,
        token,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Membership-Id": membershipId,
          },
          body: JSON.stringify({ handicap: parsed }),
        },
      );
      onUpdate(member.leagueMembershipId, updated.handicap!);
    } catch {
      toast.error("Failed to save handicap. Please try again.");
      setInputValue("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
        }}
        disabled={saving}
        className="w-20 rounded border border-input bg-background px-2 py-1 text-sm disabled:opacity-50"
        placeholder="—"
        step="0.1"
        min="0"
      />
      {saving && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
    </div>
  );
}

interface RosterTableProps {
  membershipId: string;
  token: string;
}

export function RosterTable({ membershipId, token }: RosterTableProps) {
  const [members, setMembers] = useState<RosterMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetchAuthenticated<RosterMember[]>("/commissioner/season/roster", token, {
      headers: { "X-Membership-Id": membershipId },
    })
      .then(setMembers)
      .catch(() => setError("Failed to load roster."));
  }, [membershipId, token]);

  function handleHandicapUpdate(leagueMembershipId: string, handicap: number) {
    setMembers(
      (prev) =>
        prev?.map((m) =>
          m.leagueMembershipId === leagueMembershipId ? { ...m, handicap } : m,
        ) ?? null,
    );
  }

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!members) return <p className="text-sm text-muted-foreground">Loading roster…</p>;
  if (members.length === 0)
    return <p className="text-sm text-muted-foreground">No members found.</p>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left">
          <th className="pb-2 pr-4 font-medium">Name</th>
          <th className="pb-2 pr-4 font-medium">Email</th>
          <th className="pb-2 font-medium">Handicap</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {members.map((member) => (
          <tr key={member.leagueMembershipId}>
            <td className="py-2 pr-4">
              <span>
                {member.lastName}, {member.firstName}
              </span>
              {member.isCommissioner && (
                <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  Commissioner
                </span>
              )}
            </td>
            <td className="py-2 pr-4 text-muted-foreground">{member.email}</td>
            <td className="py-2">
              <HandicapCell
                member={member}
                membershipId={membershipId}
                token={token}
                onUpdate={handleHandicapUpdate}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

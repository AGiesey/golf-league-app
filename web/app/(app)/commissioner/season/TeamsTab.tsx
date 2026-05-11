"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { apiFetchAuthenticated } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TeamCard } from "./TeamCard";

export interface TeamMember {
  leagueMembershipId: string;
  firstName: string;
  lastName: string;
}

export interface Team {
  teamId: string;
  name: string;
  members: TeamMember[];
}

interface TeamsData {
  isLocked: boolean;
  teams: Team[];
  unassigned: TeamMember[];
}

interface TeamsTabProps {
  membershipId: string;
  token: string;
}

export function TeamsTab({ membershipId, token }: TeamsTabProps) {
  const [data, setData] = useState<TeamsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [disbanding, setDisbanding] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ teamId: string; name: string } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const headers = { "X-Membership-Id": membershipId };

  useEffect(() => {
    apiFetchAuthenticated<TeamsData>("/commissioner/season/teams", token, { headers })
      .then(setData)
      .catch(() => setError("Failed to load teams data."));
  }, [membershipId, token]);

  function toggleMember(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function createTeam() {
    if (selected.size !== 2 || !data) return;
    const memberIds = Array.from(selected);
    setCreating(true);
    try {
      const created = await apiFetchAuthenticated<Team>(
        "/commissioner/season/teams",
        token,
        {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ memberIds }),
        },
      );
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          teams: [...prev.teams, created].sort((a, b) => a.name.localeCompare(b.name)),
          unassigned: prev.unassigned.filter(
            (m) => !memberIds.includes(m.leagueMembershipId),
          ),
        };
      });
      setSelected(new Set());
    } catch {
      toast.error("Failed to create team. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function disbandTeam(team: Team) {
    setDisbanding(team.teamId);
    try {
      await apiFetchAuthenticated<void>(
        `/commissioner/season/teams/${team.teamId}`,
        token,
        { method: "DELETE", headers },
      );
      setData((prev) => {
        if (!prev) return prev;
        const returnedMembers = team.members.slice().sort((a, b) =>
          a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName),
        );
        return {
          ...prev,
          teams: prev.teams.filter((t) => t.teamId !== team.teamId),
          unassigned: [...prev.unassigned, ...returnedMembers].sort(
            (a, b) =>
              a.lastName.localeCompare(b.lastName) ||
              a.firstName.localeCompare(b.firstName),
          ),
        };
      });
    } catch {
      toast.error("Failed to disband team. Please try again.");
    } finally {
      setDisbanding(null);
    }
  }

  async function renameTeam() {
    if (!editing || !editing.name.trim()) return;
    setSaving(editing.teamId);
    try {
      const updated = await apiFetchAuthenticated<{ teamId: string; name: string }>(
        `/commissioner/season/teams/${editing.teamId}/name`,
        token,
        {
          method: "PATCH",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ name: editing.name.trim() }),
        },
      );
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          teams: prev.teams.map((t) =>
            t.teamId === updated.teamId ? { ...t, name: updated.name } : t,
          ),
        };
      });
      setEditing(null);
    } catch {
      toast.error("Failed to rename team. Please try again.");
    } finally {
      setSaving(null);
    }
  }

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const { isLocked, teams, unassigned } = data;

  return (
    <div className="space-y-6">
      {isLocked && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-amber-600" />
              <CardTitle className="text-sm text-amber-800 dark:text-amber-200">
                Teams are locked — the season has started
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Unassigned pool */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">
            Unassigned Members
            {unassigned.length > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                {unassigned.length}
              </span>
            )}
          </h3>

          {unassigned.length === 0 ? (
            <p className="text-sm text-muted-foreground">All members are assigned to a team.</p>
          ) : (
            <ul className="space-y-1">
              {unassigned.map((m) => (
                <li key={m.leagueMembershipId} className="flex items-center gap-2">
                  {!isLocked && (
                    <input
                      type="checkbox"
                      id={m.leagueMembershipId}
                      checked={selected.has(m.leagueMembershipId)}
                      onChange={() => toggleMember(m.leagueMembershipId)}
                      className="size-4 rounded border-input"
                    />
                  )}
                  <label
                    htmlFor={m.leagueMembershipId}
                    className="cursor-pointer text-sm"
                  >
                    {m.lastName}, {m.firstName}
                  </label>
                </li>
              ))}
            </ul>
          )}

          {!isLocked && unassigned.length > 0 && (
            <button
              onClick={createTeam}
              disabled={selected.size !== 2 || creating}
              className="mt-2 inline-flex items-center gap-2 rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {creating && <Loader2 className="size-4 animate-spin" />}
              Create Team
            </button>
          )}
        </div>

        {/* Formed teams */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">
            Teams
            {teams.length > 0 && (
              <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {teams.length}
              </span>
            )}
          </h3>

          {teams.length === 0 ? (
            <p className="text-sm text-muted-foreground">No teams formed yet.</p>
          ) : (
            <ul className="space-y-2">
              {teams.map((team) => (
                <TeamCard
                  key={team.teamId}
                  team={team}
                  isLocked={isLocked}
                  isEditing={editing?.teamId === team.teamId}
                  editingName={editing?.teamId === team.teamId ? editing.name : ""}
                  isSaving={saving === team.teamId}
                  isDisbanding={disbanding === team.teamId}
                  onStartEdit={() => setEditing({ teamId: team.teamId, name: team.name })}
                  onNameChange={(name) => setEditing((e) => e ? { ...e, name } : null)}
                  onSaveEdit={renameTeam}
                  onCancelEdit={() => setEditing(null)}
                  onDisband={() => disbandTeam(team)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

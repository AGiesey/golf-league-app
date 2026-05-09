"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Lock, Pencil, Trash2, Plus } from "lucide-react";
import { apiFetchAuthenticated } from "@/lib/api";

interface Week {
  id: string;
  weekNumber: number;
  startDate: string;
  type: string;
}

interface TeamMember {
  firstName: string;
  lastName: string;
}

interface MatchupTeam {
  teamId: string;
  name: string;
  members: TeamMember[];
}

interface Matchup {
  matchupId: string;
  teamA: MatchupTeam;
  teamB: MatchupTeam;
  isLocked: boolean;
}

interface Team {
  teamId: string;
  name: string;
  members: { leagueMembershipId: string; firstName: string; lastName: string }[];
}

interface FormState {
  open: boolean;
  matchupId: string | undefined;
  teamAId: string;
  teamBId: string;
  submitting: boolean;
}

const CLOSED_FORM: FormState = {
  open: false,
  matchupId: undefined,
  teamAId: "",
  teamBId: "",
  submitting: false,
};

interface MatchupsClientProps {
  weeks: Week[];
  teams: Team[];
  membershipId: string;
  token: string;
  initialWeekId?: string;
}

export function MatchupsClient({
  weeks,
  teams,
  membershipId,
  token,
  initialWeekId,
}: MatchupsClientProps) {
  const router = useRouter();
  const headers = { "X-Membership-Id": membershipId };

  const regularWeeks = weeks.filter((w) => w.type === "Regular");
  const defaultWeekId =
    initialWeekId && weeks.some((w) => w.id === initialWeekId)
      ? initialWeekId
      : regularWeeks[0]?.id;

  const [selectedWeekId, setSelectedWeekId] = useState<string | undefined>(defaultWeekId);
  const [matchups, setMatchups] = useState<Matchup[] | null>(null);
  const [loadingMatchups, setLoadingMatchups] = useState(false);
  const [matchupsError, setMatchupsError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(CLOSED_FORM);
  const [deleting, setDeleting] = useState<string | null>(null);

  const selectedWeek = weeks.find((w) => w.id === selectedWeekId);
  const isRegularWeek = selectedWeek?.type === "Regular";

  useEffect(() => {
    if (!selectedWeekId) return;
    setMatchups(null);
    setMatchupsError(null);
    setLoadingMatchups(true);
    apiFetchAuthenticated<Matchup[]>(
      `/commissioner/season/matchups?weekId=${selectedWeekId}`,
      token,
      { headers },
    )
      .then(setMatchups)
      .catch(() => setMatchupsError("Failed to load matchups."))
      .finally(() => setLoadingMatchups(false));
  }, [selectedWeekId, membershipId, token]);

  function handleWeekChange(weekId: string) {
    setSelectedWeekId(weekId);
    router.replace(`?weekId=${weekId}`);
  }

  function openCreateForm() {
    setForm({ open: true, matchupId: undefined, teamAId: "", teamBId: "", submitting: false });
  }

  function openEditForm(matchup: Matchup) {
    setForm({
      open: true,
      matchupId: matchup.matchupId,
      teamAId: matchup.teamA.teamId,
      teamBId: matchup.teamB.teamId,
      submitting: false,
    });
  }

  function closeForm() {
    setForm(CLOSED_FORM);
  }

  async function submitForm() {
    if (!selectedWeekId || !form.teamAId || !form.teamBId) return;
    setForm((f) => ({ ...f, submitting: true }));
    try {
      if (form.matchupId) {
        const updated = await apiFetchAuthenticated<Matchup>(
          `/commissioner/season/matchups/${form.matchupId}`,
          token,
          {
            method: "PUT",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({ teamAId: form.teamAId, teamBId: form.teamBId }),
          },
        );
        setMatchups((prev) =>
          prev?.map((m) => (m.matchupId === form.matchupId ? updated : m)) ?? null,
        );
      } else {
        const created = await apiFetchAuthenticated<Matchup>(
          "/commissioner/season/matchups",
          token,
          {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({
              weekId: selectedWeekId,
              teamAId: form.teamAId,
              teamBId: form.teamBId,
            }),
          },
        );
        setMatchups((prev) => [...(prev ?? []), created]);
      }
      closeForm();
    } catch {
      toast.error(form.matchupId ? "Failed to update matchup." : "Failed to create matchup.");
      setForm((f) => ({ ...f, submitting: false }));
    }
  }

  async function deleteMatchup(matchupId: string) {
    setDeleting(matchupId);
    try {
      await apiFetchAuthenticated<void>(
        `/commissioner/season/matchups/${matchupId}`,
        token,
        { method: "DELETE", headers },
      );
      setMatchups((prev) => prev?.filter((m) => m.matchupId !== matchupId) ?? null);
    } catch {
      toast.error("Failed to delete matchup. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  if (weeks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No weeks have been scheduled for this season yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week selector */}
      <div className="flex items-center gap-3">
        <label htmlFor="week-select" className="text-sm font-medium">
          Week
        </label>
        <select
          id="week-select"
          value={selectedWeekId ?? ""}
          onChange={(e) => handleWeekChange(e.target.value)}
          className="rounded border border-input bg-background px-3 py-1.5 text-sm"
        >
          {weeks.map((w) => (
            <option key={w.id} value={w.id} disabled={w.type !== "Regular"}>
              Week {w.weekNumber} —{" "}
              {new Date(w.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              {w.type !== "Regular" ? ` (${w.type})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Matchups content */}
      {!selectedWeekId ? null : loadingMatchups ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading matchups…
        </div>
      ) : matchupsError ? (
        <p className="text-sm text-destructive">{matchupsError}</p>
      ) : matchups !== null && matchups.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded border border-dashed border-border p-6">
          <p className="text-sm text-muted-foreground">No matchups scheduled for this week.</p>
          {isRegularWeek && (
            <button
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
            >
              <Plus className="size-4" />
              Create Matchup
            </button>
          )}
        </div>
      ) : matchups !== null && matchups.length > 0 ? (
        <div className="space-y-3">
          <ul className="space-y-2">
            {matchups.map((m) => (
              <li
                key={m.matchupId}
                className="flex items-start justify-between rounded border border-border p-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {m.teamA.name} vs {m.teamB.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {m.teamA.members
                      .map((mb) => `${mb.lastName}, ${mb.firstName}`)
                      .join(" · ")}
                    {" — "}
                    {m.teamB.members
                      .map((mb) => `${mb.lastName}, ${mb.firstName}`)
                      .join(" · ")}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-2">
                  {m.isLocked ? (
                    <Lock
                      className="size-4 text-muted-foreground"
                      aria-label="Locked — scores have been entered"
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => openEditForm(m)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Edit matchup"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => deleteMatchup(m.matchupId)}
                        disabled={deleting === m.matchupId}
                        className="text-destructive hover:opacity-70 disabled:opacity-50"
                        aria-label="Delete matchup"
                      >
                        {deleting === m.matchupId ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {isRegularWeek && (
            <button
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-foreground hover:text-foreground"
            >
              <Plus className="size-4" />
              Add Matchup
            </button>
          )}
        </div>
      ) : null}

      {/* Create / edit dialog */}
      {form.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closeForm}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-border bg-background p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-base font-semibold">
              {form.matchupId ? "Edit Matchup" : "Create Matchup"}
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="team-a" className="text-sm font-medium">
                  Team A
                </label>
                <select
                  id="team-a"
                  value={form.teamAId}
                  onChange={(e) => setForm((f) => ({ ...f, teamAId: e.target.value }))}
                  className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm"
                >
                  <option value="">Select team…</option>
                  {teams
                    .filter((t) => t.teamId !== form.teamBId)
                    .map((t) => (
                      <option key={t.teamId} value={t.teamId}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="team-b" className="text-sm font-medium">
                  Team B
                </label>
                <select
                  id="team-b"
                  value={form.teamBId}
                  onChange={(e) => setForm((f) => ({ ...f, teamBId: e.target.value }))}
                  className="w-full rounded border border-input bg-background px-3 py-1.5 text-sm"
                >
                  <option value="">Select team…</option>
                  {teams
                    .filter((t) => t.teamId !== form.teamAId)
                    .map((t) => (
                      <option key={t.teamId} value={t.teamId}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeForm}
                disabled={form.submitting}
                className="rounded px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitForm}
                disabled={!form.teamAId || !form.teamBId || form.submitting}
                className="inline-flex items-center gap-2 rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {form.submitting && <Loader2 className="size-4 animate-spin" />}
                {form.matchupId ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { apiFetchAuthenticated } from "@/lib/api";
import { PairingHistoryMatrix } from "./PairingHistoryMatrix";
import { MatchupFormDialog } from "./MatchupFormDialog";
import { MatchupListItem } from "./MatchupListItem";

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

export interface Matchup {
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

interface UnscheduledTeam {
  teamId: string;
  name: string;
}

export interface PairingHistoryEntry {
  teamAId: string;
  teamBId: string;
  count: number;
  firstWeekNumber: number;
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
  const [unscheduledTeams, setUnscheduledTeams] = useState<UnscheduledTeam[] | null>(null);
  const [pairingHistory, setPairingHistory] = useState<PairingHistoryEntry[] | null>(null);
  const [loadingMatchups, setLoadingMatchups] = useState(false);
  const [matchupsError, setMatchupsError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(CLOSED_FORM);
  const [deleting, setDeleting] = useState<string | null>(null);

  const selectedWeek = weeks.find((w) => w.id === selectedWeekId);
  const isRegularWeek = selectedWeek?.type === "Regular";

  async function fetchWeekData(weekId: string) {
    const [newMatchups, newUnscheduled, newHistory] = await Promise.all([
      apiFetchAuthenticated<Matchup[]>(
        `/commissioner/season/matchups?weekId=${weekId}`,
        token,
        { headers },
      ),
      apiFetchAuthenticated<UnscheduledTeam[]>(
        `/commissioner/season/matchups/unscheduled-teams?weekId=${weekId}`,
        token,
        { headers },
      ),
      apiFetchAuthenticated<PairingHistoryEntry[]>(
        "/commissioner/season/pairing-history",
        token,
        { headers },
      ),
    ]);
    setMatchups(newMatchups);
    setUnscheduledTeams(newUnscheduled);
    setPairingHistory(newHistory);
  }

  useEffect(() => {
    if (!selectedWeekId) return;
    setMatchups(null);
    setUnscheduledTeams(null);
    setPairingHistory(null);
    setMatchupsError(null);
    setLoadingMatchups(true);
    fetchWeekData(selectedWeekId)
      .catch(() => setMatchupsError("Failed to load matchup data."))
      .finally(() => setLoadingMatchups(false));
  }, [selectedWeekId, membershipId, token]);

  function handleWeekChange(weekId: string) {
    setSelectedWeekId(weekId);
    router.replace(`?weekId=${weekId}`);
  }

  function openCreateForm(preselectedTeamId?: string) {
    setForm({
      open: true,
      matchupId: undefined,
      teamAId: preselectedTeamId ?? "",
      teamBId: "",
      submitting: false,
    });
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
        await apiFetchAuthenticated<Matchup>(
          `/commissioner/season/matchups/${form.matchupId}`,
          token,
          {
            method: "PUT",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({ teamAId: form.teamAId, teamBId: form.teamBId }),
          },
        );
      } else {
        await apiFetchAuthenticated<Matchup>(
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
      }
      closeForm();
      await fetchWeekData(selectedWeekId);
    } catch {
      toast.error(form.matchupId ? "Failed to update matchup." : "Failed to create matchup.");
      setForm((f) => ({ ...f, submitting: false }));
    }
  }

  async function deleteMatchup(matchupId: string) {
    if (!selectedWeekId) return;
    setDeleting(matchupId);
    try {
      await apiFetchAuthenticated<void>(
        `/commissioner/season/matchups/${matchupId}`,
        token,
        { method: "DELETE", headers },
      );
      await fetchWeekData(selectedWeekId);
    } catch {
      toast.error("Failed to delete matchup. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  const pairWarning = (() => {
    if (!form.teamAId || !form.teamBId || !pairingHistory) return null;
    const [a, b] = [form.teamAId, form.teamBId].sort();
    const entry = pairingHistory.find((e) => e.teamAId === a && e.teamBId === b);
    return entry && entry.count > 0 ? entry.firstWeekNumber : null;
  })();

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

      {/* Loading / error */}
      {!selectedWeekId ? null : loadingMatchups ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading matchup data…
        </div>
      ) : matchupsError ? (
        <p className="text-sm text-destructive">{matchupsError}</p>
      ) : (
        <div className="space-y-6">
          {/* Unscheduled teams */}
          {isRegularWeek && unscheduledTeams !== null && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Unscheduled Teams
              </p>
              {unscheduledTeams.length === 0 ? (
                <p className="text-sm text-muted-foreground">All teams scheduled this week.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {unscheduledTeams.map((t) => (
                    <button
                      key={t.teamId}
                      onClick={() => openCreateForm(t.teamId)}
                      className="rounded-full border border-border bg-muted px-3 py-1 text-sm hover:border-primary hover:bg-primary/10 hover:text-primary"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Matchup list */}
          {matchups !== null && matchups.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded border border-dashed border-border p-6">
              <p className="text-sm text-muted-foreground">No matchups scheduled for this week.</p>
              {isRegularWeek && (
                <button
                  onClick={() => openCreateForm()}
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
                  <MatchupListItem
                    key={m.matchupId}
                    matchup={m}
                    deleting={deleting}
                    onEdit={openEditForm}
                    onDelete={deleteMatchup}
                  />
                ))}
              </ul>

              {isRegularWeek && (
                <button
                  onClick={() => openCreateForm()}
                  className="inline-flex items-center gap-2 rounded border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-foreground hover:text-foreground"
                >
                  <Plus className="size-4" />
                  Add Matchup
                </button>
              )}
            </div>
          ) : null}

          {/* Pairing history matrix */}
          {pairingHistory !== null && teams.length > 1 && (
            <PairingHistoryMatrix teams={teams} history={pairingHistory} />
          )}
        </div>
      )}

      <MatchupFormDialog
        open={form.open}
        isEditing={!!form.matchupId}
        teams={teams}
        teamAId={form.teamAId}
        teamBId={form.teamBId}
        submitting={form.submitting}
        pairWarning={pairWarning}
        onTeamAChange={(id) => setForm((f) => ({ ...f, teamAId: id }))}
        onTeamBChange={(id) => setForm((f) => ({ ...f, teamBId: id }))}
        onSubmit={submitForm}
        onClose={closeForm}
      />
    </div>
  );
}

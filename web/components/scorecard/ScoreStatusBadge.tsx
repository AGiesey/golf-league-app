import { Badge } from "@/components/ui/badge";

export function nineLabel(nine: string): string {
  if (nine === "Front") return "Front 9";
  if (nine === "Back") return "Back 9";
  return "18 holes";
}

export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" },
): string {
  return new Date(iso).toLocaleDateString("en-US", options);
}

interface ScoreStatusBadgeProps {
  slotCount: number;
  roundCount: number;
}

export function ScoreStatusBadge({ slotCount, roundCount }: ScoreStatusBadgeProps) {
  if (slotCount === 0) {
    return <Badge variant="secondary">No matchups</Badge>;
  }
  if (roundCount === 0) {
    return <Badge variant="outline">Not started</Badge>;
  }
  if (roundCount < slotCount) {
    return (
      <Badge variant="default" className="bg-warning-500 text-white hover:bg-warning-500">
        Partial
      </Badge>
    );
  }
  return (
    <Badge variant="default" className="bg-success-500 text-white hover:bg-success-500">
      Complete
    </Badge>
  );
}

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LeagueHeaderProps {
  leagueName: string;
  seasonYear: number;
  isCommissioner: boolean;
  children?: React.ReactNode;
}

export function LeagueHeader({
  leagueName,
  seasonYear,
  isCommissioner,
  children,
}: LeagueHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle className="text-2xl">{leagueName}</CardTitle>
          {isCommissioner && <Badge>Commissioner</Badge>}
        </div>
        <CardDescription>Season {seasonYear}</CardDescription>
      </CardHeader>
      {children}
    </Card>
  );
}


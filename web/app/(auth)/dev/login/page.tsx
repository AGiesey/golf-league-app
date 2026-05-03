import { connection } from "next/server";
import { notFound } from "next/navigation";
import { H1 } from "@/components/typography";
import { Lead } from "@/components/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import GolferSelector from "./GolferSelector";

interface Golfer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export default async function DevLoginPage() {
  await connection();

  const res = await fetch(`${API_URL}/dev/golfers`, { cache: "no-store" });

  if (!res.ok) {
    notFound();
  }

  const golfers: Golfer[] = await res.json();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader>
          <H1>Log in as...</H1>
          <Lead>Select a golfer to begin your session.</Lead>
        </CardHeader>
        <CardContent>
          <GolferSelector golfers={golfers} />
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Golfer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Props {
  golfers: Golfer[];
}

export default function GolferSelector({ golfers }: Props) {
  const router = useRouter();

  async function handleSelect(golferId: string) {
    await fetch("/api/dev/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ golferId }),
    });
    router.push("/me");
  }

  return (
    <div className="flex flex-col gap-2">
      {golfers.map((g) => (
        <Button
          key={g.id}
          variant="outline"
          className="w-full justify-start gap-3 h-auto py-3"
          onClick={() => handleSelect(g.id)}
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs">
              {g.firstName[0]}{g.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="font-medium">{g.firstName} {g.lastName}</span>
            <span className="text-xs text-muted-foreground">{g.email}</span>
          </div>
        </Button>
      ))}
    </div>
  );
}

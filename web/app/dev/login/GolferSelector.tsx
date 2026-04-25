"use client";

import { useRouter } from "next/navigation";

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
    <ul>
      {golfers.map((g) => (
        <li key={g.id}>
          <button onClick={() => handleSelect(g.id)}>
            {g.firstName} {g.lastName} ({g.email})
          </button>
        </li>
      ))}
    </ul>
  );
}

import { connection } from "next/server";
import { notFound } from "next/navigation";
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
    <main>
      <h1>Log in as...</h1>
      <GolferSelector golfers={golfers} />
    </main>
  );
}

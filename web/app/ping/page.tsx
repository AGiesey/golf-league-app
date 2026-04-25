// Connectivity spike — remove once real features exist.
import { connection } from "next/server";
import { apiFetch, ApiError } from "@/lib/api";

interface PingResponse {
  id: number;
  createdAt: string;
}

export default async function PingPage() {
  // connection() opts into dynamic rendering so process.env.API_URL
  // is read at request time (not baked in at build time).
  await connection();

  let result: PingResponse | null = null;
  let error: string | null = null;

  try {
    result = await apiFetch<PingResponse>("/ping");
  } catch (err) {
    error =
      err instanceof ApiError
        ? `API error ${err.status}: ${err.body}`
        : "Could not reach the API.";
  }

  return (
    <main style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>Connectivity Spike — /ping</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && (
        <dl>
          <dt>id</dt>
          <dd>{result.id}</dd>
          <dt>createdAt</dt>
          <dd>{result.createdAt}</dd>
        </dl>
      )}
    </main>
  );
}

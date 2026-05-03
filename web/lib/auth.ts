import { cookies } from "next/headers";

const provider = process.env.AUTH_PROVIDER ?? "mock";

export async function getAccessToken(): Promise<string> {
  if (provider === "mock") {
    const cookieStore = await cookies();
    const token = cookieStore.get("app-token")?.value;
    if (!token) throw new Error("No mock session");
    return token;
  }

  const { getAuth0Client } = await import("./auth0");
  const result = await getAuth0Client().getAccessToken();
  if (!result.token) throw new Error("No Auth0 access token");
  return result.token;
}

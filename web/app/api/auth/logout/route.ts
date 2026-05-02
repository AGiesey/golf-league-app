import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const provider = process.env.AUTH_PROVIDER ?? "mock";
const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

export async function GET() {
  if (provider === "auth0") {
    return NextResponse.redirect(new URL("/auth/logout", baseUrl));
  }

  const cookieStore = await cookies();
  cookieStore.delete("app-token");
  return NextResponse.redirect(new URL("/", baseUrl));
}

import { cookies } from "next/headers";

const provider = process.env.AUTH_PROVIDER ?? "mock";

export async function GET(request: Request) {
  if (provider === "auth0") {
    return Response.redirect(new URL("/auth/logout", request.url));
  }

  const cookieStore = await cookies();
  cookieStore.delete("app-token");
  return Response.redirect(new URL("/", request.url));
}

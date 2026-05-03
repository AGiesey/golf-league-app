import type { NextRequest } from "next/server";

const provider = process.env.AUTH_PROVIDER ?? "mock";
const PROTECTED_PATHS = ["/me", "/dashboard", "/pick-league"];

export async function proxy(request: NextRequest) {
  const { pathname } = new URL(request.url);

  if (provider === "auth0") {
    const { getAuth0Client } = await import("./lib/auth0");
    const client = getAuth0Client();

    if (pathname === "/" || pathname === "/login") {
      const session = await client.getSession(request);
      if (session) {
        return Response.redirect(new URL("/dashboard", request.url));
      }
      if (pathname === "/") {
        return Response.redirect(new URL("/login", request.url));
      }
    }

    return await client.middleware(request);
  }

  // Mock mode: redirect unauthenticated users away from / and protected paths
  const cookieHeader = request.headers.get("cookie") ?? "";
  const hasToken = cookieHeader.split(";").some((c) => c.trim().startsWith("app-token="));

  if (pathname === "/") {
    return Response.redirect(
      new URL(hasToken ? "/dashboard" : "/dev/login", request.url)
    );
  }

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (isProtected && !hasToken) {
    return Response.redirect(new URL("/dev/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

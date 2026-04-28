const provider = process.env.AUTH_PROVIDER ?? "mock";
const PROTECTED_PATHS = ["/me"];

export async function proxy(request: Request) {
  if (provider === "auth0") {
    const { getAuth0Client } = await import("./lib/auth0");
    return await getAuth0Client().middleware(request);
  }

  // Mock mode: redirect to /dev/login if app-token cookie is absent on protected paths.
  const url = new URL(request.url);
  const isProtected = PROTECTED_PATHS.some((p) => url.pathname.startsWith(p));
  if (isProtected) {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const hasToken = cookieHeader.split(";").some((c) => c.trim().startsWith("app-token="));
    if (!hasToken) {
      return Response.redirect(new URL("/dev/login", request.url));
    }
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

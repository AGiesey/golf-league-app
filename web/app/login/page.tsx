import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  if (process.env.AUTH_PROVIDER !== "auth0") {
    redirect("/dev/login");
  }

  return (
    <main>
      <h1>Sign in</h1>
      <a href="/auth/login">Log in with Auth0</a>
    </main>
  );
}

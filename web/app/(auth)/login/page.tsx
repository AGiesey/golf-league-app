import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  if (process.env.AUTH_PROVIDER !== "auth0") {
    redirect("/dev/login");
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Golf League</CardTitle>
          <CardDescription>
            Manage your league — scores, schedules, and standings in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href="/auth/login"
            className={cn(buttonVariants({ size: "lg" }), "w-full justify-center")}
          >
            Sign in with Auth0
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

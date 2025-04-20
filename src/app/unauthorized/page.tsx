// ~/app/unauthorized/page.tsx
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="mb-6 rounded-full bg-red-50 p-5">
        <ShieldAlert className="h-12 w-12 text-red-500" />
      </div>

      <h1 className="mb-2 text-3xl font-bold">Unauthorized Access</h1>

      <p className="text-muted-foreground mb-8 max-w-md text-center">
        You do not have permission to access this page. Please contact your
        administrator if you believe this is an error.
      </p>

      <div className="flex space-x-4">
        <Button asChild>
          <Link href="/">Go to Homepage</Link>
        </Button>

        <Button variant="outline" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}

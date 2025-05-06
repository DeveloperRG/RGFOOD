// ~/app/(auth)/verification-error/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";

export default function VerificationErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Define error messages
  const errorMessages: Record<string, { title: string; description: string }> =
    {
      "invalid-token": {
        title: "Invalid verification link",
        description:
          "The verification link is invalid or has already been used.",
      },
      "token-expired": {
        title: "Verification link expired",
        description:
          "The verification link has expired. Please request a new one.",
      },
      "user-not-found": {
        title: "User not found",
        description:
          "We couldn't find an account associated with this verification link.",
      },
      "server-error": {
        title: "Server error",
        description:
          "An unexpected error occurred during verification. Please try again later.",
      },
    };

  const errorInfo = errorMessages[error || ""] || {
    title: "Verification Failed",
    description: "There was a problem verifying your email address.",
  };

  return (
    <div className="relative container flex h-screen w-screen flex-col items-center justify-center">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center text-lg font-bold">
          <span className="mr-2">🍽️</span> Riau Garden FoodCourt
        </Link>
      </div>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <Alert variant="destructive" className="py-6">
          <AlertTitle className="text-lg font-semibold">
            {errorInfo.title}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {errorInfo.description}
          </AlertDescription>
        </Alert>

        <div className="flex flex-col space-y-4">
          <Button asChild>
            <Link href="/login">Kembali ke Login</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/register">Register Kembali</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

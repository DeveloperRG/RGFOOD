// ~/app/(auth)/verify/page.tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Loader2, Mail, ArrowRight } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResendVerification = async () => {
    if (!email) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification email");
      }

      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative container flex h-screen w-screen flex-col items-center justify-center">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center text-lg font-bold">
          <span className="mr-2">🍽️</span> FoodCourt
        </Link>
      </div>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="mb-4 rounded-full bg-blue-50 p-3">
            <Mail className="h-10 w-10 text-blue-500" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Verify Your Email
          </h1>

          <p className="text-muted-foreground max-w-md text-sm">
            We've sent a verification email to{" "}
            <strong>{email || "your email address"}</strong>. Please check your
            inbox and click the link to verify your account.
          </p>
        </div>

        <div className="rounded-lg border border-gray-100 bg-gray-50 p-6">
          <h3 className="mb-3 font-medium">What happens next:</h3>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex">
              <span className="mr-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
                1
              </span>
              <span>Check your email inbox for the verification message</span>
            </li>
            <li className="flex">
              <span className="mr-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
                2
              </span>
              <span>Click the verification link in the email</span>
            </li>
            <li className="flex">
              <span className="mr-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
                3
              </span>
              <span>You'll be redirected to the login page or dashboard</span>
            </li>
          </ol>
        </div>

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertTitle className="text-green-800">Email Sent!</AlertTitle>
            <AlertDescription className="text-green-700">
              A new verification email has been sent. Please check your inbox.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col space-y-4">
          <Button
            onClick={handleResendVerification}
            disabled={isSubmitting || !email}
            className="relative"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend Verification Email"
            )}
          </Button>

          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild size="sm">
              <Link href="/login">Return to login</Link>
            </Button>

            <Button variant="outline" asChild size="sm">
              <Link href="/" className="flex items-center gap-1">
                Go to home <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="text-muted-foreground text-center text-sm">
          <p>
            Don't see the email? Check your spam folder or try another email
            address.
          </p>
        </div>
      </div>
    </div>
  );
}

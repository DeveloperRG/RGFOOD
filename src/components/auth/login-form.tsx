// ~/components/auth/login-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Loader2 } from "lucide-react";
import { UserRole } from "~/types/shared-types";


const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const isVerified = searchParams.get("verified") === "true";

  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "CredentialsSignin"
      ? "Invalid email or password"
      : null,
  );
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showVerificationSuccess, setShowVerificationSuccess] =
    useState(isVerified);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  useEffect(() => {
    // Hide the verification success message after 5 seconds
    if (showVerificationSuccess) {
      const timer = setTimeout(() => {
        setShowVerificationSuccess(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showVerificationSuccess]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(data: LoginFormValues) {
    try {
      setError(null);
      setEmailNotVerified(false);

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "EMAIL_NOT_VERIFIED") {
          setEmailNotVerified(true);
          setUnverifiedEmail(data.email);
          return;
        }

        setError("Invalid email or password");
        return;
      }

      // Get user role from session to determine redirect
      const response = await fetch("/api/auth/session");
      const session = await response.json();

      let redirectUrl = "/";

      if (session?.user?.role) {
        // Redirect based on role
        switch (session.user.role) {
          case UserRole.ADMIN:
            redirectUrl = "/admin";
            break;
          case UserRole.FOODCOURT_OWNER:
            redirectUrl = "/owner";
            break;
          default:
            redirectUrl = "/";
        }
      }

      router.push(redirectUrl);
      router.refresh();
    } catch (error) {
      setError("An unexpected error occurred");
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn("google", { callbackUrl });
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;

    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: unverifiedEmail }),
      });

      router.push(`/verify?email=${encodeURIComponent(unverifiedEmail)}`);
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      setError("Failed to resend verification email");
    }
  };

  // Show special UI for unverified email
  if (emailNotVerified) {
    return (
      <div className="space-y-6">
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTitle className="text-yellow-800">
            Email Not Verified
          </AlertTitle>
          <AlertDescription className="text-yellow-700">
            Your email address hasn't been verified yet. Please check your inbox
            for a verification email or click below to resend it.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col space-y-4">
          <Button onClick={handleResendVerification}>
            Resend Verification Email
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              router.push(
                `/verify?email=${encodeURIComponent(unverifiedEmail || "")}`,
              )
            }
          >
            Verification Instructions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showVerificationSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <AlertTitle className="text-green-800">Email Verified!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your email has been successfully verified. You can now sign in to
            your account.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    {...field}
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Button
                    variant="link"
                    className="h-auto p-0 font-normal"
                    asChild
                  >
                    <a href="/forgot-password">Forgot password?</a>
                  </Button>
                </div>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    {...field}
                    type="password"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in
              </>
            ) : (
              "Sign in with Email"
            )}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        type="button"
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg
            className="mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
            <path d="M1 1h22v22H1z" fill="none" />
          </svg>
        )}
        Google
      </Button>
    </div>
  );
}

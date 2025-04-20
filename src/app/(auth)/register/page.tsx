// ~/app/(auth)/register/page.tsx

"use client";

import Link from "next/link";
import { RegisterForm } from "~/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="relative container flex h-screen w-screen flex-col items-center justify-center">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center text-lg font-bold">
          <span className="mr-2">🍽️</span> FoodCourt
        </Link>
      </div>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign up to start using our platform
          </p>
        </div>

        <RegisterForm />

        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

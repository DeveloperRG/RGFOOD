// ~/app/(auth)/login/page.tsx
"use client";

import Link from "next/link";
import { LoginForm } from "~/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative container flex min-h-screen w-screen flex-col items-center justify-center px-4">
      {/* Logo dan nama aplikasi */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Link href="/" className="flex items-center text-lg font-bold">
          <span className="mr-2">🍽️</span> Riau Garden FoodCourt
        </Link>
      </div>

      {/* Konten utama */}
      <div className="mx-auto flex w-full max-w-sm flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Selamat Datang
          </h1>
          <p className="text-muted-foreground text-sm">
            Masuk ke akunmu untuk lanjut yuk~
          </p>
        </div>

        {/* Form login */}
        <LoginForm />

        {/* Link ke halaman register */}
        <p className="text-muted-foreground text-center text-sm">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="text-primary underline-offset-4 hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}

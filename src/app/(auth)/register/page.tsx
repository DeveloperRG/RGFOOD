// ~/app/(auth)/register/page.tsx

"use client";

import Link from "next/link";
import { RegisterForm } from "~/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="relative container flex min-h-screen w-screen flex-col items-center justify-center px-4">
      {/* Logo dan navigasi ke beranda */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Link href="/" className="flex items-center text-lg font-bold">
          <span className="mr-2">🍽️</span> Riau Garden FoodCourt
        </Link>
      </div>

      {/* Konten utama */}
      <div className="mx-auto flex w-full max-w-sm flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Daftar Akun Baru
          </h1>
          <p className="text-muted-foreground text-sm">
            Yuk, buat akun dan mulai gunakan layanan kami!
          </p>
        </div>

        {/* Form pendaftaran */}
        <RegisterForm />

        {/* Link ke halaman login */}
        <p className="text-muted-foreground text-center text-sm">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

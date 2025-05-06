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
        throw new Error(
          data.message || "Gagal mengirim ulang email verifikasi",
        );
      }

      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tak terduga",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative container flex min-h-screen w-screen flex-col items-center justify-center px-4">
      {/* Logo aplikasi */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Link href="/" className="flex items-center text-lg font-bold">
          <span className="mr-2">🍽️</span> FoodCourt
        </Link>
      </div>

      {/* Konten utama */}
      <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="mb-4 rounded-full bg-blue-50 p-3">
            <Mail className="h-10 w-10 text-blue-500" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight">
            Verifikasi Email Kamu
          </h1>

          <p className="text-muted-foreground max-w-md text-sm">
            Kami telah mengirimkan email verifikasi ke{" "}
            <strong>{email || "alamat email kamu"}</strong>. Silakan cek kotak
            masuk dan klik tautan verifikasi untuk mengaktifkan akunmu.
          </p>
        </div>

        {/* Langkah-langkah selanjutnya */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-6">
          <h3 className="mb-3 font-medium">Langkah selanjutnya:</h3>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex">
              <span className="mr-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
                1
              </span>
              <span>Cek kotak masuk email kamu</span>
            </li>
            <li className="flex">
              <span className="mr-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
                2
              </span>
              <span>Klik tautan verifikasi yang kami kirimkan</span>
            </li>
            <li className="flex">
              <span className="mr-3 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
                3
              </span>
              <span>Kamu akan diarahkan ke halaman login atau dashboard</span>
            </li>
          </ol>
        </div>

        {/* Notifikasi sukses atau error */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertTitle className="text-green-800">
              Email Dikirim Ulang!
            </AlertTitle>
            <AlertDescription className="text-green-700">
              Email verifikasi baru telah dikirim. Silakan periksa kotak masuk
              kamu.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tombol tindakan */}
        <div className="flex flex-col space-y-4">
          <Button
            onClick={handleResendVerification}
            disabled={isSubmitting || !email}
            className="relative"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              "Kirim Ulang Email Verifikasi"
            )}
          </Button>

          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild size="sm">
              <Link href="/login">Kembali ke Login</Link>
            </Button>

            <Button variant="outline" asChild size="sm">
              <Link href="/" className="flex items-center gap-1">
                Beranda <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Catatan tambahan */}
        <div className="text-muted-foreground text-center text-sm">
          <p>
            Tidak menerima email? Coba cek folder spam atau gunakan alamat email
            lain.
          </p>
        </div>
      </div>
    </div>
  );
}
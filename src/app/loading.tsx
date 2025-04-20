// src/app/loading.tsx

"use client";

import { Progress } from "~/components/ui/progress";
import { useEffect, useState } from "react";

export default function LoadingPage() {
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 20;
        return next >= 100 ? 100 : next;
      });
    }, 500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-center px-4">
      <Progress value={progress} className="w-full max-w-md" />
    </div>
  );
}

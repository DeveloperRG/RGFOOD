// ~/components/auth-status.tsx
"use client";

import { useSession } from "next-auth/react";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading authentication...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Not signed in</div>;
  }

  return (
    <div>
      <p>Signed in as {session?.user?.email}</p>
      <p>Role: {session?.user?.role}</p>
    </div>
  );
}

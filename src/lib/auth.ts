// ~/lib/auth.ts

import { type User } from "@prisma/client";
import { type Session } from "next-auth";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { UserRole } from "~/server/auth/config";

// Helper to check if user is authenticated
export async function getAuthSession() {
  return await auth();
}

// Get current authenticated user or redirect
export async function getCurrentUser(): Promise<User> {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return session.user as unknown as User;
}

// Check if user has required role or redirect
export async function checkRole(
  allowedRoles: UserRole[] = [
    UserRole.ADMIN,
    UserRole.OWNER,
  ],
) {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.user.role as UserRole)) {
    redirect("/unauthorized");
  }

  return session;
}

// Function to check if a user is an admin
export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === UserRole.ADMIN;
}

// Function to check if a user is a foodcourt owner
export function isFoodcourtOwner(session: Session | null): boolean {
  return session?.user?.role === UserRole.OWNER;
}

// Function to check if the user owns a specific foodcourt
export async function checkFoodcourtOwnership(
  session: Session | null,
  foodcourtId: string,
): Promise<boolean> {
  if (!session?.user) return false;

  // For admins, always return true
  if (session.user.role === UserRole.ADMIN) return true;

  // For foodcourt owners, check ownership
  if (session.user.role === UserRole.OWNER) {
    // Get the user's owned foodcourts
    const response = await fetch(`/api/users/${session.user.id}/foodcourts`);
    const { foodcourts } = await response.json();

    return foodcourts.some((fc: any) => fc.id === foodcourtId);
  }

  return false;
}

// ~/server/auth/config.ts

import NextAuth from "next-auth";
import { authConfig } from "~/server/auth/config";

/**
 * Initializes NextAuth with the provided configuration.
 * This will be used by the app to handle authentication.
 *
 * Export the auth object to be used throughout the app.
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

/**
 * Export the NextAuth handler for API routes
 */
export const { GET, POST } = handlers;

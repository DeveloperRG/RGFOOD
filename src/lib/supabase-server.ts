// ~/lib/supabase-server.ts
import { createClient } from "@supabase/supabase-js";
import { type Session } from "next-auth";
import { auth } from "~/server/auth";
import { type Database } from "~/types/supabase";

/**
 * Creates an authenticated Supabase client for server components and API routes
 * @param sessionOrUserId - Either a Next Auth session or a user ID string
 */
export function createServerSupabaseClient(
  sessionOrUserId?: Session | string | null,
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let authHeader = "";

  if (typeof sessionOrUserId === "string") {
    // If a user ID is directly provided
    authHeader = `Bearer ${sessionOrUserId}`;
  } else if (sessionOrUserId?.user?.id) {
    // If a session object is provided
    authHeader = `Bearer ${sessionOrUserId.user.id}`;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
}

/**
 * Gets an authenticated Supabase client using the current session
 * For use in server components and API routes
 */
export async function getServerSupabase() {
  const session = await auth();
  return createServerSupabaseClient(session);
}

// Example usage in a server component:
// export async function MyServerComponent() {
//   const supabase = await getServerSupabase();
//   const { data } = await supabase.from('foodcourts').select('*');
//   // Render with data...
// }

// Example usage in an API route:
// export async function GET() {
//   const supabase = await getServerSupabase();
//   const { data, error } = await supabase.from('foodcourts').select('*');
//
//   if (error) {
//     return Response.json({ error: error.message }, { status: 500 });
//   }
//
//   return Response.json({ data });
// }
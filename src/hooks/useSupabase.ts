// ~/lib/hooks/useSupabase.ts
import { useSession } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import { useMemo } from "react";
import { type Database } from "~/types/supabase";

/**
 * Custom hook that provides an authenticated Supabase client
 * Uses the NextAuth session to authenticate with Supabase
 * This enables Row Level Security policies to work properly
 */
export function useSupabase() {
  const { data: session } = useSession();

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: session?.user ? `Bearer ${session.user.id}` : "",
        },
      },
    });
  }, [session]);

  return supabase;
}

// Example usage:
// const MyComponent = () => {
//   const supabase = useSupabase();
//
//   const fetchData = async () => {
//     const { data, error } = await supabase.from('foodcourts').select('*');
//     // RLS policies will be applied based on the user's role and ID
//   };
// }

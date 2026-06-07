'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Handles Supabase implicit (hash) flow — magic links and email confirmations that
// land with #access_token= in the URL instead of ?code= (PKCE flow).
// Cleans the hash from the URL (security) and redirects to /dashboard.
export default function AuthHandler() {
  const router = useRouter();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }
    if (!window.location.hash.includes('access_token=')) return;

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search,
        );
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}

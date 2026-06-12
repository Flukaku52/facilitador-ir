"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { loadEntitlement } from "@/lib/premium/premium-storage";
import {
  isPremiumActive,
  PremiumEntitlement,
} from "@/lib/premium/premium-status";

type EntitlementState = {
  userId: string;
  entitlement: PremiumEntitlement | null;
};

// Convidado, Supabase não configurado, sem linha ou erro => não-premium (fail-closed).
export function usePremium() {
  const { user, loading: authLoading } = useAuth();
  // Resultado keyed por userId: troca de usuário invalida o resultado anterior
  // sem precisar de setState síncrono no effect.
  const [loaded, setLoaded] = useState<EntitlementState | null>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const userId = user.id;
    loadEntitlement(userId)
      .then((entitlement) => {
        if (mounted) setLoaded({ userId, entitlement });
      })
      .catch(() => {
        if (mounted) setLoaded({ userId, entitlement: null });
      });
    return () => {
      mounted = false;
    };
  }, [user]);

  if (!user) {
    return { isPremium: false, loading: authLoading, user };
  }

  const ready = loaded !== null && loaded.userId === user.id;
  return {
    // Invariante: (!user || !isPremiumActive) => bloqueado. O caso !user já
    // retornou acima com isPremium: false; aqui a dupla checagem garante que
    // estado residual de outro usuário nunca libere premium.
    isPremium: ready && loaded !== null && isPremiumActive(loaded.entitlement),
    loading: !ready,
    user,
  };
}

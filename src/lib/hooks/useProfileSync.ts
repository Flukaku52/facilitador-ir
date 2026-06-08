'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getCurrentTaxYear } from '@/lib/tax-years';
import {
  loadTaxProfile,
  saveTaxProfile,
  loadChecklistState,
  saveChecklistStateMap,
} from '@/lib/storage/local-profile-storage';
import {
  decideMigration,
  loadCloudProfile,
  saveCloudProfile,
  loadCloudChecklist,
  saveCloudChecklist,
} from '@/lib/storage/cloud-profile-storage';
import { TaxProfile } from '@/types/tax-profile';

// Persists in localStorage so the migration modal only appears once per user,
// even across browser sessions. Bump the version suffix if migration logic changes.
const MIGRATION_FLAG = 'ir_migration_v1_handled';
const PROFILE_LS_KEY = 'ir_facilitador_profile';
const CHECKLIST_LS_KEY = 'ir_facilitador_checklist';

export type SyncState = 'idle' | 'migration-needed' | 'error';

export type UseProfileSyncResult = {
  syncState: SyncState;
  cloudProfile: TaxProfile | null;
  migrate: () => Promise<void>;
  discardLocal: () => Promise<void>;
  cancelMigration: () => void;
};

export function useProfileSync(): UseProfileSyncResult {
  const { user } = useAuth();
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [cloudProfile, setCloudProfile] = useState<TaxProfile | null>(null);
  const prevUserId = useRef<string | null>(null);

  // On login transition: determine if migration is needed
  useEffect(() => {
    if (!user) {
      prevUserId.current = null;
      return;
    }

    const isNewLogin = prevUserId.current !== user.id;
    prevUserId.current = user.id;
    if (!isNewLogin) return;

    // Already handled for this browser — skip (truthy check is backward-compatible
    // with old sessions that stored user.id instead of the 'v1' marker).
    if (localStorage.getItem(MIGRATION_FLAG)) return;

    let mounted = true;

    // loadTaxProfile is synchronous; extract it first so taxYear is available
    // for the Supabase query without waiting for the async cloud fetch.
    const localProfile = loadTaxProfile();
    const taxYear = localProfile?.taxYear ?? getCurrentTaxYear();

    loadCloudProfile(user.id, taxYear)
      .then((fetchedCloud) => {
        if (!mounted) return;

        const decision = decideMigration(localProfile, fetchedCloud);

        if (decision === 'none') {
          localStorage.setItem(MIGRATION_FLAG, 'v1');
        } else if (decision === 'load-cloud') {
          // Silently hydrate localStorage from Supabase
          saveTaxProfile(fetchedCloud!);
          loadCloudChecklist(user.id, fetchedCloud!.taxYear).then((cloudChecklist) => {
            if (mounted) saveChecklistStateMap(cloudChecklist);
          });
          localStorage.setItem(MIGRATION_FLAG, 'v1');
        } else {
          // 'prompt': local data exists — ask the user
          setCloudProfile(fetchedCloud);
          setSyncState('migration-needed');
        }
      })
      .catch(() => {
        if (mounted) setSyncState('error');
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  // Real-time sync to Supabase when localStorage changes (same tab via notify())
  useEffect(() => {
    if (!user) return;

    const userId = user.id;

    function handleStorage(e: StorageEvent) {
      if (e.key === PROFILE_LS_KEY) {
        const profile = loadTaxProfile();
        if (profile) saveCloudProfile(userId, profile).catch(() => {});
      }
      if (e.key === CHECKLIST_LS_KEY) {
        const checklist = loadChecklistState();
        const profile = loadTaxProfile();
        saveCloudChecklist(userId, checklist, profile?.taxYear ?? getCurrentTaxYear()).catch(() => {});
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [user]);

  const migrate = useCallback(async () => {
    if (!user) return;
    const profile = loadTaxProfile();
    const checklist = loadChecklistState();
    if (profile) await saveCloudProfile(user.id, profile);
    if (Object.keys(checklist).length > 0)
      await saveCloudChecklist(user.id, checklist, profile?.taxYear ?? getCurrentTaxYear());
    localStorage.setItem(MIGRATION_FLAG, 'v1');
    setSyncState('idle');
  }, [user]);

  const discardLocal = useCallback(async () => {
    if (!user) return;
    const localProfile = loadTaxProfile();
    const taxYear = localProfile?.taxYear ?? getCurrentTaxYear();
    const [fetchedCloud, cloudChecklist] = await Promise.all([
      loadCloudProfile(user.id, taxYear),
      loadCloudChecklist(user.id, taxYear),
    ]);
    if (fetchedCloud) saveTaxProfile(fetchedCloud);
    saveChecklistStateMap(cloudChecklist);
    localStorage.setItem(MIGRATION_FLAG, 'v1');
    setSyncState('idle');
  }, [user]);

  const cancelMigration = useCallback(() => {
    if (!user) return;
    localStorage.setItem(MIGRATION_FLAG, 'v1');
    setSyncState('idle');
  }, [user]);

  return { syncState, cloudProfile, migrate, discardLocal, cancelMigration };
}

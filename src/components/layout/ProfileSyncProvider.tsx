'use client';

import { useProfileSync } from '@/lib/hooks/useProfileSync';
import MigrationModal from '@/components/layout/MigrationModal';

export default function ProfileSyncProvider() {
 const { syncState, cloudProfile, migrate, discardLocal, cancelMigration } = useProfileSync();

 return (
 <MigrationModal
 open={syncState === 'migration-needed'}
 cloudProfile={cloudProfile}
 onMigrate={migrate}
 onDiscard={discardLocal}
 onCancel={cancelMigration}
 />
 );
}

'use client';

import { useProfileCorrupted } from '@/lib/hooks/useStoredProfile';
import Toast from '@/components/ui/Toast';

export default function CorruptedDataToast() {
  const show = useProfileCorrupted();
  return (
    <Toast
      show={show}
      message="Seus dados anteriores não puderam ser carregados e foram removidos automaticamente."
    />
  );
}

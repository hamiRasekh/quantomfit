'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/ui/auth/context/jwt';
import { paths } from '@/ui/routes/paths';

export function useLogout() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      setIsPending(true);
      await signOut();
      router.push(paths.auth.jwt.signIn);
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [router]);

  return {
    handleLogout,
    isPending,
  };
}


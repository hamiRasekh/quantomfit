'use client';

import { useState, useEffect } from 'react';

import { paths } from '@/ui/routes/paths';
import { useRouter, usePathname } from '@/ui/routes/hooks';

import { CONFIG } from '@/ui/global-config';
import { SplashScreen } from '@/components/ui/loading-screen';
import { TENANT_SLUG_STORAGE_KEY } from '../context/jwt/constant';

import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

type AuthGuardProps = {
  children: React.ReactNode;
};

const signInPaths = {
  jwt: paths.auth.jwt.signIn,
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { authenticated, loading } = useAuthContext();

  const [isChecking, setIsChecking] = useState(true);

  const createRedirectPath = (currentPath: string) => {
    const queryString = new URLSearchParams({ returnTo: pathname }).toString();
    return `${currentPath}?${queryString}`;
  };

  const checkPermissions = async (): Promise<void> => {
    if (loading) {
      return;
    }

    if (!authenticated) {
      const { method } = CONFIG.auth;

      const tenantSlug =
        typeof window !== 'undefined'
          ? (sessionStorage.getItem(TENANT_SLUG_STORAGE_KEY) ||
              localStorage.getItem(TENANT_SLUG_STORAGE_KEY))
          : null;
      const signInPath = tenantSlug
        ? `/${tenantSlug}/login`
        : signInPaths[method];
      const redirectPath = createRedirectPath(signInPath);

      router.replace(redirectPath);

      return;
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading]);

  if (isChecking) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}

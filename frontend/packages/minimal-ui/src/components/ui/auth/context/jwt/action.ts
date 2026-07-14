'use client';

import axios, { endpoints } from '@/ui/lib/axios';

import { setSession } from './utils';
import { JWT_STORAGE_KEY, TENANT_SLUG_COOKIE_KEY, TENANT_SLUG_STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
  tenantSlug?: string;
};

export type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password, tenantSlug }: SignInParams): Promise<void> => {
  try {
    const params = { email, password };

    if (tenantSlug?.trim()) {
      const normalized = tenantSlug.trim().toLowerCase();
      sessionStorage.setItem(TENANT_SLUG_STORAGE_KEY, normalized);
      localStorage.setItem(TENANT_SLUG_STORAGE_KEY, normalized);
      document.cookie = `${TENANT_SLUG_COOKIE_KEY}=${normalized}; path=/`;
    }

    const res = await axios.post(endpoints.auth.signIn, params);

    // Backend returns: { statusCode, message, data: { accessToken, user } }
    const accessToken = res.data?.data?.accessToken || res.data?.accessToken;

    if (!accessToken) {
      throw new Error('توکن دسترسی در پاسخ یافت نشد');
    }

    setSession(accessToken);
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  email,
  password,
  firstName,
  lastName,
}: SignUpParams): Promise<void> => {
  const params = {
    email,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    // Backend returns: { statusCode, message, data: { accessToken, user } }
    const accessToken = res.data?.data?.accessToken || res.data?.accessToken;

    if (!accessToken) {
      throw new Error('توکن دسترسی در پاسخ یافت نشد');
    }

    sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);
    localStorage.setItem(JWT_STORAGE_KEY, accessToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};

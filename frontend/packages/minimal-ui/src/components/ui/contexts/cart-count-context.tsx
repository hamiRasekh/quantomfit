'use client';

import { useContext, createContext } from 'react';

/**
 * Cart Context
 * 
 * This context provides cart data and user information across the application.
 * The context is defined in libs but provided in apps.
 * 
 * Usage in apps:
 * - Create a provider that uses your cart store
 * - Wrap your app with the provider
 * 
 * Usage in libs:
 * - Use useCartContext() hook to get cart data
 */

export interface ProfilePictureUrl {
  original?: string;
  medium?: string;
  small?: string;
  extra_small?: string;
}

export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  nickname?: string;
  bio?: string;
  profile_picture_url?: ProfilePictureUrl;
  created_at?: string;
  updated_at?: string;
  // Mock user compatibility properties
  displayName?: string;
  photoURL?: string;
  role?: string;
  // Auth store compatibility
  mobile?: string;
  mobile_country_code?: string;
  username?: string;
}

export interface CartContextValue {
  itemCount: number;
  user: User | null;
  isAuthenticated: boolean;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

/**
 * Hook to get cart data from context
 * Returns safe defaults if context is not provided
 */
export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  return {
    itemCount: context?.itemCount ?? 0,
    user: context?.user ?? null,
    isAuthenticated: context?.isAuthenticated ?? false,
  };
}

/**
 * Hook to get cart item count from context
 * Returns 0 if context is not provided (safe default)
 */
export function useCartCountContext(): number {
  const context = useContext(CartContext);
  return context?.itemCount ?? 0;
}

/**
 * Hook to get user data from context
 * Returns null if context is not provided (safe default)
 */
export function useUserContext(): User | null {
  const context = useContext(CartContext);
  return context?.user ?? null;
}

/**
 * Hook to get authentication status from context
 * Returns false if context is not provided (safe default)
 */
export function useAuthContext(): boolean {
  const context = useContext(CartContext);
  return context?.isAuthenticated ?? false;
}


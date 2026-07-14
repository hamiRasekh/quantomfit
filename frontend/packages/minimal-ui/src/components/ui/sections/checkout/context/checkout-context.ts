'use client';

import type { CheckoutContextValue } from '@/types/checkout';

import { createContext } from 'react';

// ----------------------------------------------------------------------

export const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

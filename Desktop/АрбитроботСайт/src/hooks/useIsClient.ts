'use client';
import { useEffect, useState } from 'react';

/**
 * Hook to detect if code is running on client side
 * Returns false during SSR and initial render, true after mount
 *
 * Use this to conditionally render client-only content and avoid hydration errors
 */
export function useIsClient(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}

'use client';
import { PropsWithChildren } from 'react';
import { useIsClient } from '@/hooks/useIsClient';

type Props = { fallback?: React.ReactNode };

/**
 * NoSSR component - prevents server-side rendering of children
 * Renders fallback during SSR, children only on client after mount
 *
 * Use for:
 * - Dynamic data (current block, RPC counters, etc.)
 * - Date/time displays
 * - Live terminal output
 * - Any content that differs between server and client
 */
export default function NoSSR({ children, fallback = null }: PropsWithChildren<Props>) {
  const ready = useIsClient();
  return ready ? <>{children}</> : <>{fallback}</>;
}

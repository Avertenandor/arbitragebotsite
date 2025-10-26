'use client';

import { useEffect, useState, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ClientOnly component to prevent hydration mismatches
 * Renders children only on the client side, after hydration is complete
 *
 * This is useful for:
 * - Web3/MetaMask components that access window.ethereum
 * - Components that use localStorage/sessionStorage
 * - Components with browser-only APIs
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial hydration, render fallback
  if (!mounted) {
    return <>{fallback}</>;
  }

  // After hydration, render children
  return <>{children}</>;
}

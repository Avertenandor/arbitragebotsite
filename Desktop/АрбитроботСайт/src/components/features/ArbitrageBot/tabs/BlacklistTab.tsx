'use client';

import ComingSoonTab from './ComingSoonTab';

export default function BlacklistTab() {
  return (
    <ComingSoonTab
      icon="❌"
      title="Blacklist"
      description="Список заблокированных токенов, причины блокировки, категории (Honeypot, Suspicious, No Liquidity)"
    />
  );
}

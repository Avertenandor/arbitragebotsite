/**
 * Deterministic formatting utilities for SSR safety
 *
 * These utilities ensure consistent output between server and client renders
 * by using fixed locale and timezone settings.
 */

export const APP_LOCALE = process.env.NEXT_PUBLIC_APP_LOCALE ?? 'ru-RU';
export const APP_TZ     = process.env.NEXT_PUBLIC_APP_TZ     ?? 'UTC';

/**
 * Format number with consistent locale
 * @param n - Number to format
 * @param opt - Intl.NumberFormat options
 */
export function fmtNumber(n: number, opt?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(APP_LOCALE, opt).format(n);
}

/**
 * Format date with consistent locale and timezone
 * @param d - Date to format
 * @param opt - Intl.DateTimeFormat options
 */
export function fmtDate(d: Date, opt?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(APP_LOCALE, { timeZone: APP_TZ, ...opt }).format(d);
}

/**
 * Format date/time with common patterns
 */
export const formatters = {
  /**
   * Format as "01.01.2025"
   */
  shortDate: (d: Date) => fmtDate(d, { day: '2-digit', month: '2-digit', year: 'numeric' }),

  /**
   * Format as "1 января 2025"
   */
  longDate: (d: Date) => fmtDate(d, { day: 'numeric', month: 'long', year: 'numeric' }),

  /**
   * Format as "14:30:45"
   */
  time: (d: Date) => fmtDate(d, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),

  /**
   * Format as "01.01.2025 14:30:45"
   */
  dateTime: (d: Date) => fmtDate(d, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }),

  /**
   * Format currency with 2 decimal places
   */
  currency: (n: number, currency = 'USD') => fmtNumber(n, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }),

  /**
   * Format percentage with 2 decimal places
   */
  percent: (n: number) => fmtNumber(n, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }),

  /**
   * Format compact number (1K, 1M, etc.)
   */
  compact: (n: number) => fmtNumber(n, {
    notation: 'compact',
    compactDisplay: 'short'
  }),
};

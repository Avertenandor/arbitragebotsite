import { useEffect, useRef, useState } from 'react';

export interface CounterOptions {
  start?: number;
  duration?: number; // ms
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string; // Thousand separator
  easing?: (t: number) => number;
}

const defaultEasing = (t: number) => {
  // easeOutCubic
  return 1 - Math.pow(1 - t, 3);
};

export function useCounter(
  end: number,
  options: CounterOptions = {}
): string {
  const {
    start = 0,
    duration = 2000,
    decimals = 0,
    prefix = '',
    suffix = '',
    separator = ',',
    easing = defaultEasing,
  } = options;

  const [count, setCount] = useState(start);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    // Reset if end changes
    setCount(start);
    startTimeRef.current = undefined;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apply easing
      const easedProgress = easing(progress);
      
      // Calculate current value
      const current = start + (end - start) * easedProgress;
      setCount(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, start, duration, easing]);

  // Format number
  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    
    // Add thousand separators
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    
    return prefix + parts.join('.') + suffix;
  };

  return formatNumber(count);
}

// Specialized hooks
export function useCurrencyCounter(
  end: number,
  currency: string = '$',
  decimals: number = 2
): string {
  return useCounter(end, {
    prefix: currency,
    decimals,
    separator: ',',
  });
}

export function usePercentageCounter(
  end: number,
  decimals: number = 1
): string {
  return useCounter(end, {
    suffix: '%',
    decimals,
  });
}

export function useNumberCounter(end: number): string {
  return useCounter(end, {
    decimals: 0,
    separator: ',',
  });
}

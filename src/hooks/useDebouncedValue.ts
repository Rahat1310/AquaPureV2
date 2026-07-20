"use client";

import { useEffect, useState } from "react";

/**
 * Debounce a rapidly changing value (e.g. search input).
 * Returns the value only after `delayMs` of inactivity.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

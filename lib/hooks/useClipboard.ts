"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = useCallback(async (text: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    await navigator.clipboard.writeText(text);
    setCopied(true);

    timeoutRef.current = setTimeout(() => {
      setCopied(false);
      timeoutRef.current = null;
    }, 1500);
  }, []);

  return { copy, copied };
}

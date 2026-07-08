"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getGroqApiKeyHeaders,
} from "@/lib/utils/api-key-storage";

interface HealthResponse {
  ok: boolean;
  error?: string;
}

export function useHealthCheck() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/health", {
        headers: getGroqApiKeyHeaders(),
      });
      const data = (await response.json()) as HealthResponse;
      const isHealthy = data.ok === true;
      setHasApiKey(isHealthy);
      return isHealthy;
    } catch {
      setHasApiKey(false);
      return false;
    }
  }, []);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  return {
    hasApiKey,
    setHasApiKey,
    checkHealth,
  };
}

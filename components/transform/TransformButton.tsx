"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TransformButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

export function TransformButton({
  onClick,
  disabled,
  isLoading,
}: TransformButtonProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDisabled = disabled || isLoading;

  return (
    <div className="px-4 md:px-6">
      <Button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        aria-label={isLoading ? "Dönüştürülüyor" : "İçeriği dönüştür"}
        className={cn(
          "h-10 w-full rounded-lg bg-accent-primary text-sm font-medium text-white",
          "hover:bg-accent-hover",
          "focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
          "disabled:opacity-50",
        )}
      >
        {isLoading ? (
          <>
            <Loader2
              className={cn(
                "h-4 w-4",
                !prefersReducedMotion && "animate-spin",
              )}
              aria-hidden="true"
            />
            Dönüştürülüyor...
          </>
        ) : (
          "Dönüştür"
        )}
      </Button>
    </div>
  );
}

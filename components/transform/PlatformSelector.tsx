"use client";

import {
  Briefcase,
  Image,
  List,
  Mail,
  MessageCircle,
  Newspaper,
  Share2,
  Text,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PLATFORMS,
  type PlatformIconName,
  type PlatformId,
} from "@/lib/constants/platforms";
import { cn } from "@/lib/utils";

const PLATFORM_ICONS: Record<PlatformIconName, LucideIcon> = {
  Briefcase,
  MessageCircle,
  Image,
  Share2,
  Newspaper,
  Mail,
  Text,
  List,
};

export interface PlatformSelectorProps {
  selected: PlatformId | null;
  onSelect: (platformId: PlatformId) => void;
  disabled: boolean;
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

export function PlatformSelector({
  selected,
  onSelect,
  disabled,
}: PlatformSelectorProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [pressedId, setPressedId] = useState<PlatformId | null>(null);

  const handlePlatformClick = (platformId: PlatformId) => {
    if (disabled) {
      return;
    }

    if (!prefersReducedMotion) {
      setPressedId(platformId);
      window.setTimeout(() => setPressedId(null), 150);
    }

    onSelect(platformId);
  };

  return (
    <TooltipProvider>
      <section className="flex flex-col gap-3 px-4 md:px-6">
        <h2 className="text-sm font-medium text-text-primary">Platform</h2>

        <div
          role="radiogroup"
          aria-label="Platform seçimi"
          className={cn(
            "flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory",
            "md:grid md:grid-cols-2 md:overflow-visible md:snap-none",
            "lg:flex lg:overflow-x-auto lg:snap-x",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          {PLATFORMS.map((platform) => {
            const Icon = PLATFORM_ICONS[platform.icon];
            const isSelected = selected === platform.id;
            const isPressed = pressedId === platform.id;

            return (
              <Tooltip key={platform.id}>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={platform.label}
                      disabled={disabled}
                      onClick={() => handlePlatformClick(platform.id)}
                      className={cn(
                        "flex min-w-[140px] shrink-0 snap-start flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors",
                        "hover:bg-bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
                        "md:min-w-0",
                        isSelected
                          ? "border-accent-primary bg-accent-primary/10"
                          : "border-border-default bg-bg-surface",
                        !prefersReducedMotion &&
                          "transition-transform duration-150 ease-out",
                        !prefersReducedMotion && isPressed && "scale-[0.98]",
                        !prefersReducedMotion && !isPressed && "scale-100",
                      )}
                    />
                  }
                >
                  <Icon className="h-5 w-5 text-accent-primary" aria-hidden="true" />
                  <span className="text-sm font-medium text-text-primary">
                    {platform.label}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{platform.description}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </section>
    </TooltipProvider>
  );
}

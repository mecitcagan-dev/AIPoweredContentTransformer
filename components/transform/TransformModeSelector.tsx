"use client";

import { cn } from "@/lib/utils";

export type TransformMode = "bundle" | "single";

export interface TransformModeSelectorProps {
  mode: TransformMode;
  onModeChange: (mode: TransformMode) => void;
  disabled?: boolean;
}

const MODE_OPTIONS: { id: TransformMode; label: string }[] = [
  { id: "bundle", label: "Bundle (SEO + Sosyal)" },
  { id: "single", label: "Gelişmiş: Tek Platform Seç" },
];

export function TransformModeSelector({
  mode,
  onModeChange,
  disabled = false,
}: TransformModeSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Dönüşüm modu seçimi"
      className="mx-4 flex rounded-lg border border-border-default bg-bg-elevated p-1 md:mx-6"
    >
      {MODE_OPTIONS.map((option) => {
        const isSelected = mode === option.id;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            disabled={disabled}
            onClick={() => onModeChange(option.id)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
              isSelected
                ? "bg-accent-primary text-white"
                : "text-text-muted hover:bg-bg-surface hover:text-text-primary",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

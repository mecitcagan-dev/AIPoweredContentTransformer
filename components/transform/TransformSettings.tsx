"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LENGTHS, TONES, type Length, type Tone } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

export interface TransformSettingsProps {
  tone: Tone;
  onToneChange: (tone: Tone) => void;
  audience: string;
  onAudienceChange: (audience: string) => void;
  length: Length;
  onLengthChange: (length: Length) => void;
}

const TONE_OPTIONS = Object.values(TONES);
const LENGTH_OPTIONS = Object.values(LENGTHS);

export function TransformSettings({
  tone,
  onToneChange,
  audience,
  onAudienceChange,
  length,
  onLengthChange,
}: TransformSettingsProps) {
  return (
    <section className="px-4 md:px-6">
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              className="group flex w-full items-center justify-between px-3 py-1.5 hover:bg-transparent"
              aria-label="Gelişmiş ayarları aç veya kapat"
            />
          }
        >
          <span className="text-sm font-medium text-text-primary">
            Gelişmiş Ayarlar
          </span>
          <ChevronDown
            className="h-4 w-4 text-text-muted transition-transform duration-200 group-data-[panel-open]:rotate-180"
            aria-hidden="true"
          />
        </CollapsibleTrigger>

        <CollapsibleContent
          className={cn(
            "overflow-hidden transition-all duration-200 ease-in-out",
            "data-[starting-style]:h-0 data-[ending-style]:h-0",
          )}
        >
          <div className="flex flex-col gap-4 pt-3 pb-1">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tone-select">Ton</Label>
              <div
                role="radiogroup"
                aria-label="Ton seçimi"
                id="tone-select"
                className="flex flex-wrap gap-2"
              >
                {TONE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={tone === option}
                    aria-label={`Ton: ${option}`}
                    onClick={() => onToneChange(option)}
                    className={cn(
                      "cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
                      tone === option
                        ? "border-accent-primary bg-accent-primary/10 text-text-primary"
                        : "border-border-default bg-bg-surface text-text-muted hover:bg-bg-elevated",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="audience-input">Hedef kitle</Label>
              <Input
                id="audience-input"
                type="text"
                value={audience}
                onChange={(event) => onAudienceChange(event.target.value)}
                placeholder="Genel"
                aria-label="Hedef kitle"
                className="border-border-default bg-bg-base text-text-primary"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="length-select">Uzunluk</Label>
              <div
                role="radiogroup"
                aria-label="Uzunluk seçimi"
                id="length-select"
                className="flex flex-wrap gap-2"
              >
                {LENGTH_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={length === option}
                    aria-label={`Uzunluk: ${option}`}
                    onClick={() => onLengthChange(option)}
                    className={cn(
                      "cursor-pointer rounded-lg border px-3 py-1.5 text-sm transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
                      length === option
                        ? "border-accent-primary bg-accent-primary/10 text-text-primary"
                        : "border-border-default bg-bg-surface text-text-muted hover:bg-bg-elevated",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}

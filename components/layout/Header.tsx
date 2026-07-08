"use client";

import { Settings, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  return (
    <TooltipProvider>
      <header className="flex h-14 items-center justify-between border-b border-border-default px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Sparkles
            className="h-5 w-5 text-accent-primary"
            aria-hidden="true"
          />
          <h1 className="text-2xl font-semibold text-text-primary">
            İçerik Dönüştürücü
          </h1>
        </div>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="API anahtarı yapılandırması"
                onClick={onOpenSettings}
              />
            }
          >
            <Settings className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>API anahtarı yapılandırması</TooltipContent>
        </Tooltip>
      </header>
    </TooltipProvider>
  );
}

"use client";

import { Settings, Sparkles } from "lucide-react";
import { useState } from "react";

import { OnboardingDialog } from "@/components/layout/OnboardingDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
  const [settingsOpen, setSettingsOpen] = useState(false);

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
                onClick={() => setSettingsOpen(true)}
              />
            }
          >
            <Settings className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>API anahtarı yapılandırması</TooltipContent>
        </Tooltip>
      </header>

      <OnboardingDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        closable
      />
    </TooltipProvider>
  );
}

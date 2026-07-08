"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const GROQ_CONSOLE_URL = "https://console.groq.com/keys";
const DEV_RESTART_MESSAGE =
  "Sunucu yeniden başlatılıyor olabilir, birkaç saniye sonra tekrar deneyin.";
const DEFAULT_ERROR_MESSAGE = "Bir hata oluştu. Lütfen tekrar deneyin.";

type TestStatus = "idle" | "loading" | "success" | "error";

interface HealthResponse {
  ok: boolean;
  error?: string;
}

export interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Ayarlar'dan açıldığında kapatılabilir; FTUE'de false. */
  closable?: boolean;
  onSuccess?: () => void;
}

export function OnboardingDialog({
  open,
  onOpenChange,
  closable = false,
  onSuccess,
}: OnboardingDialogProps) {
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const hasEverSucceededRef = useRef(false);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && !closable) {
        return;
      }

      onOpenChange(nextOpen);

      if (!nextOpen) {
        setTestStatus("idle");
        setTestMessage(null);
      }
    },
    [closable, onOpenChange],
  );

  const handleTestConnection = useCallback(async () => {
    setTestStatus("loading");
    setTestMessage(null);

    try {
      const response = await fetch("/api/health");

      let data: HealthResponse | null = null;

      try {
        data = (await response.json()) as HealthResponse;
      } catch {
        data = null;
      }

      if (data?.ok) {
        hasEverSucceededRef.current = true;
        setTestStatus("success");
        setTestMessage("Bağlantı başarılı. Uygulamayı kullanmaya başlayabilirsiniz.");
        onSuccess?.();
        handleOpenChange(false);
        return;
      }

      if (data?.error) {
        setTestStatus("error");
        setTestMessage(data.error);
        return;
      }

      setTestStatus("error");

      if (!hasEverSucceededRef.current) {
        setTestMessage(DEV_RESTART_MESSAGE);
        return;
      }

      setTestMessage(DEFAULT_ERROR_MESSAGE);
    } catch {
      setTestStatus("error");

      if (!hasEverSucceededRef.current) {
        setTestMessage(DEV_RESTART_MESSAGE);
        return;
      }

      setTestMessage("Bağlantı hatası. İnternet bağlantınızı kontrol edin.");
    }
  }, [handleOpenChange, onSuccess]);

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      disablePointerDismissal={!closable}
      modal
    >
      <DialogContent
        showCloseButton={closable}
        className="border-border-default bg-bg-surface sm:max-w-md"
        aria-describedby="onboarding-description"
      >
        <DialogHeader>
          <DialogTitle className="text-text-primary">
            API Anahtarı Yapılandırması
          </DialogTitle>
          <DialogDescription id="onboarding-description">
            Groq API anahtarınızı yapılandırarak içerik dönüştürme özelliğini
            etkinleştirin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm text-text-primary">
          <p>
            <a
              href={GROQ_CONSOLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary underline underline-offset-2 hover:text-accent-hover"
            >
              Groq API anahtarınızı buradan alın
            </a>
          </p>

          <div className="space-y-2">
            <p className="font-medium">`.env.local` dosyasına ekleyin:</p>
            <pre className="overflow-x-auto rounded-lg border border-border-default bg-bg-elevated p-3 font-mono text-xs text-text-muted">
              GROQ_API_KEY=gsk_...
            </pre>
          </div>

          {testStatus === "success" && testMessage && (
            <p className="text-state-success" role="status">
              {testMessage}
            </p>
          )}

          {testStatus === "error" && testMessage && (
            <p className="text-state-error" role="alert">
              {testMessage}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-start">
          <Button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus === "loading"}
            aria-label="Bağlantıyı test et"
          >
            {testStatus === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Test ediliyor...
              </>
            ) : (
              "Bağlantıyı Test Et"
            )}
          </Button>

          {closable && (
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              aria-label="Dialogu kapat"
            >
              Kapat
            </Button>
          )}

          {testStatus === "success" && closable && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleOpenChange(false)}
              aria-label="Devam et"
            >
              Devam Et
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

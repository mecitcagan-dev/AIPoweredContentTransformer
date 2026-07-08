"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getGroqApiKeyHeaders,
  getStoredApiKey,
  setStoredApiKey,
} from "@/lib/utils/api-key-storage";

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
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const hasEverSucceededRef = useRef(false);

  useEffect(() => {
    if (open) {
      const storedKey = getStoredApiKey();
      setApiKeyInput(storedKey ?? "");
      setTestStatus("idle");
      setTestMessage(null);
    }
  }, [open]);

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

  const handleSaveAndTest = useCallback(async () => {
    const trimmedKey = apiKeyInput.trim();

    if (!trimmedKey) {
      setTestStatus("error");
      setTestMessage("API anahtarı bulunamadı");
      return;
    }

    setTestStatus("loading");
    setTestMessage(null);
    setStoredApiKey(trimmedKey);

    try {
      const response = await fetch("/api/health", {
        headers: getGroqApiKeyHeaders(),
      });

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

        if (closable) {
          handleOpenChange(false);
        }

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
  }, [apiKeyInput, closable, handleOpenChange, onSuccess]);

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
            Groq API anahtarınızı girerek içerik dönüştürme özelliğini
            etkinleştirin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm text-text-primary">
          <p>
            <a
              href={GROQ_CONSOLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary underline underline-offset-2 hover:text-accent-hover cursor-pointer"
            >
              Groq API anahtarınızı buradan alın
            </a>
          </p>

          <div className="space-y-2">
            <Label htmlFor="groq-api-key-input">API Anahtarı</Label>
            <Input
              id="groq-api-key-input"
              type="password"
              value={apiKeyInput}
              onChange={(event) => setApiKeyInput(event.target.value)}
              placeholder="gsk_..."
              autoComplete="off"
              aria-label="Groq API anahtarı"
              className="border-border-default bg-bg-base font-mono text-text-primary"
            />
          </div>

          <p className="text-xs text-text-muted">
            API anahtarınız yalnızca bu tarayıcıda saklanır, hiçbir sunucuya
            kaydedilmez.
          </p>

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
            onClick={handleSaveAndTest}
            disabled={testStatus === "loading"}
            aria-label="API anahtarını kaydet"
          >
            {testStatus === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Test ediliyor...
              </>
            ) : (
              "Kaydet"
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

"use client";

import { Upload } from "lucide-react";
import { useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SAMPLE_ARTICLE } from "@/lib/constants/sample-article";

const MIN_SOURCE_LENGTH = 50;
const WARNING_SOURCE_LENGTH = 4000;

export interface SourcePanelProps {
  value: string;
  onChange: (value: string) => void;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).length;
}

export function SourcePanel({ value, onChange }: SourcePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const counterId = useId();
  const errorId = useId();
  const warningId = useId();

  const characterCount = value.length;
  const wordCount = countWords(value);
  const isEmpty = value.trim().length === 0;
  const showWarning = characterCount >= WARNING_SOURCE_LENGTH;
  const showError = !isEmpty && characterCount < MIN_SOURCE_LENGTH;

  const describedBy = [
    counterId,
    showError ? errorId : null,
    showWarning ? warningId : null,
  ]
    .filter(Boolean)
    .join(" ");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "txt" && extension !== "md") {
      return;
    }

    const content = await file.text();
    onChange(content);
  };

  const handleLoadSample = () => {
    onChange(SAMPLE_ARTICLE);
  };

  return (
    <section className="flex h-full flex-col gap-3 bg-bg-surface p-4 md:p-6">
      <h2 className="text-sm font-medium text-text-primary">Kaynak</h2>

      {showWarning && (
        <p
          id={warningId}
          role="status"
          className="rounded-lg border border-state-warning/30 bg-state-warning/10 px-3 py-2 text-sm text-state-warning"
        >
          Uzun metinlerde dönüşüm kalitesi düşebilir
        </p>
      )}

      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Dönüştürmek istediğiniz makaleyi buraya yapıştırın veya dosya yükleyin."
        className="min-h-[320px] max-h-[480px] cursor-text overflow-y-auto resize-y border-border-default bg-bg-base text-sm text-text-primary"
        aria-label="Kaynak metin"
        aria-describedby={describedBy || undefined}
        aria-invalid={showError}
      />

      {showError && (
        <p id={errorId} role="alert" className="text-sm text-state-error">
          En az 50 karakter girin
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p id={counterId} className="text-xs text-text-muted">
          {characterCount} karakter · {wordCount} kelime
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md"
            className="hidden"
            aria-hidden="true"
            onChange={handleFileUpload}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            aria-label="TXT veya MD dosyası yükle"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Dosya yükle
          </Button>

          {isEmpty && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLoadSample}
              aria-label="Örnek makale yükle"
            >
              Örnek makale yükle
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

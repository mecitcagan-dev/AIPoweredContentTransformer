import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type TransformStep = "source" | "settings" | "result";

export interface TransformStepperProps {
  currentStep: TransformStep;
}

const STEPS: { id: TransformStep; label: string }[] = [
  { id: "source", label: "Kaynak" },
  { id: "settings", label: "Ayarlar" },
  { id: "result", label: "Sonuç" },
];

const STEP_ORDER: TransformStep[] = ["source", "settings", "result"];

function getStepStatus(
  stepId: TransformStep,
  currentStep: TransformStep,
): "completed" | "active" | "upcoming" {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const stepIndex = STEP_ORDER.indexOf(stepId);

  if (stepIndex < currentIndex) {
    return "completed";
  }

  if (stepIndex === currentIndex) {
    return "active";
  }

  return "upcoming";
}

export function TransformStepper({ currentStep }: TransformStepperProps) {
  return (
    <nav
      aria-label="Dönüşüm adımları"
      className="flex items-center justify-center gap-2 px-4 py-3 md:px-6"
    >
      {STEPS.map((step, index) => {
        const status = getStepStatus(step.id, currentStep);
        const isLast = index === STEPS.length - 1;

        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className="flex items-center gap-2" aria-current={status === "active" ? "step" : undefined}>
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium",
                  status === "active" &&
                    "border-accent-primary bg-accent-primary text-white",
                  status === "completed" &&
                    "border-accent-primary/50 bg-accent-primary/20 text-accent-primary",
                  status === "upcoming" &&
                    "border-border-default bg-bg-surface text-text-muted",
                )}
                aria-hidden="true"
              >
                {status === "completed" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  status === "active" && "text-accent-primary",
                  status === "completed" && "text-text-primary",
                  status === "upcoming" && "text-text-muted",
                )}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <span
                className={cn(
                  "mx-1 hidden h-px w-8 sm:block",
                  status === "completed"
                    ? "bg-accent-primary/50"
                    : "bg-border-default",
                )}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

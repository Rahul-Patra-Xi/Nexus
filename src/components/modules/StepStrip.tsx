import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const LABELS = ["Discover", "Select", "Confirm", "Track", "Done"] as const;

type Props = {
  active: number;
  length?: number;
  className?: string;
};

export const StepStrip = ({ active, length = 5, className }: Props) => {
  const n = Math.min(length, LABELS.length);
  return (
    <div className={cn("flex items-center justify-between gap-1 mb-6 overflow-x-auto pb-1", className)}>
      {LABELS.slice(0, n).map((lab, i) => {
        const done = i < active;
        const cur = i === active;
        return (
          <div key={lab} className="flex flex-col items-center min-w-[52px] flex-1">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                done && "bg-success border-success text-success-foreground",
                cur && !done && "border-primary bg-gradient-primary text-primary-foreground shadow-neu-raised-sm",
                !cur && !done && "border-border/60 text-muted-foreground bg-gradient-surface",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn("text-[9px] mt-1 font-semibold uppercase tracking-wide text-center", cur ? "text-foreground" : "text-muted-foreground")}>
              {lab}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const StepStripShort = ({ labels, active }: { labels: string[]; active: number }) => (
  <div className="flex items-center justify-between gap-1 mb-6">
    {labels.map((lab, i) => {
      const done = i < active;
      const cur = i === active;
      return (
        <div key={lab} className="flex flex-col items-center flex-1 min-w-0">
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2",
              done && "bg-success border-success text-success-foreground",
              cur && !done && "border-primary bg-gradient-primary text-primary-foreground",
              !cur && !done && "border-border/60 text-muted-foreground",
            )}
          >
            {done ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          <span className={cn("text-[9px] mt-1 font-semibold uppercase truncate w-full text-center", cur ? "text-foreground" : "text-muted-foreground")}>
            {lab}
          </span>
        </div>
      );
    })}
  </div>
);

import { cn } from "@/lib/utils";
import { Navigation } from "lucide-react";

type Props = {
  title?: string;
  subtitle?: string;
  className?: string;
};

export const MapStub = ({ title = "Live map", subtitle = "Streets & traffic layer simulated", className }: Props) => {
  return (
    <div className={cn("relative rounded-2xl overflow-hidden shadow-neu-raised border border-border/40 bg-muted/30 h-44", className)}>
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: "18px 18px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/15" />
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</div>
          <div className="text-xs font-medium text-foreground/90">{subtitle}</div>
        </div>
        <div className="px-2 py-1 rounded-lg bg-background/80 text-[10px] font-semibold border border-border/50 flex items-center gap-1">
          <Navigation className="h-3 w-3" /> Live
        </div>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-6">
        <span className="h-3 w-3 rounded-full bg-primary shadow-lg ring-4 ring-primary/25" title="You" />
        <span className="h-3 w-3 rounded-full bg-amber-500 shadow-lg ring-4 ring-amber-500/20" title="Partner" />
      </div>
    </div>
  );
};

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const NeuActionButton = ({ className, variant = "primary", children, disabled, ...rest }: Props) => (
  <motion.button
    whileTap={{ scale: disabled ? 1 : 0.97 }}
    className={cn(
      "w-full py-3.5 rounded-2xl font-semibold text-sm transition-shadow disabled:opacity-50",
      variant === "primary" && "bg-gradient-primary text-primary-foreground shadow-neu-raised-sm hover:shadow-neu-raised",
      variant === "secondary" && "bg-gradient-surface shadow-neu-raised-sm border border-border/50 hover:shadow-neu-raised",
      variant === "ghost" && "neu-pressed-sm hover:shadow-neu-raised-sm",
      className,
    )}
    disabled={disabled}
    {...rest}
  >
    {children}
  </motion.button>
);

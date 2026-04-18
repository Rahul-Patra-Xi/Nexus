import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface QuickActionButtonProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  index?: number;
}

export const QuickActionButton = ({ label, icon: Icon, onClick, index = 0 }: QuickActionButtonProps) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      whileTap={{ scale: 0.94 }}
      className="group flex flex-col items-center gap-1 xs:gap-1.5 sm:gap-2 flex-shrink-0"
    >
      <div className="relative">
        <div className="h-10 w-10 xs:h-12 xs:w-12 sm:h-16 sm:w-16 rounded-xl xs:rounded-2xl sm:rounded-3xl bg-gradient-surface shadow-neu-raised flex items-center justify-center transition-all duration-200 group-hover:shadow-neu-raised-lg group-active:shadow-neu-pressed">
          <Icon className="h-4 w-4 xs:h-5 xs:w-5 sm:h-7 sm:w-7 text-foreground/80 transition-transform group-hover:scale-110 group-active:scale-95" strokeWidth={2} />
        </div>
      </div>
      <span className="text-[9px] xs:text-[10px] sm:text-xs font-medium text-foreground/70 group-hover:text-foreground transition-colors whitespace-nowrap max-w-[50px] xs:max-w-[60px] sm:max-w-none truncate">{label}</span>
    </motion.button>
  );
};

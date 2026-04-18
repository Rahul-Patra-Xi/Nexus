import { Search, Bell, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface TopBarProps {
  onSearchFocus?: () => void;
  onBellClick?: () => void;
  notifCount?: number;
}

export const TopBar = ({ onSearchFocus, onBellClick, notifCount = 0 }: TopBarProps) => {
  const [dark, setDark] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);

  const display = profile?.display_name || user?.email?.split("@")[0] || "Guest";
  const initials = display.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 px-2 xs:px-3 sm:px-6 pt-2 xs:pt-3 sm:pt-4 pb-2 xs:pb-3 backdrop-blur-md bg-background/70">
      <div className="max-w-6xl mx-auto flex items-center gap-1.5 xs:gap-2 sm:gap-3">
        <Link to={user ? "/profile" : "/auth"}>
          <motion.div whileTap={{ scale: 0.95 }} className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 pr-1.5 xs:pr-2 sm:pr-3 pl-0.5 xs:pl-1 sm:pl-1.5 py-1 xs:py-1.5 rounded-full bg-gradient-surface shadow-neu-raised-sm flex-shrink-0">
            <div className="h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-[10px] xs:text-xs sm:text-sm font-bold shadow-neu-raised-sm">
              {initials}
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-xs text-muted-foreground">{user ? "Welcome" : "Sign in"}</div>
              <div className="text-sm font-semibold text-foreground -mt-0.5">{display.split(" ")[0]}</div>
            </div>
          </motion.div>
        </Link>

        <button
          onClick={onSearchFocus}
          className="flex-1 flex items-center gap-1.5 xs:gap-2 sm:gap-3 px-2 xs:px-3 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-full neu-pressed-sm text-left group"
        >
          <Search className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <span className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground truncate">
            Search services, providers…
          </span>
          <kbd className="ml-auto hidden md:inline-flex h-4.5 xs:h-5 sm:h-6 items-center gap-1 rounded-md border border-border bg-surface-raised px-1 xs:px-1.5 sm:px-2 text-[8px] xs:text-[9px] sm:text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setDark((d) => !d)}
          className="h-8 w-8 xs:h-9 xs:w-9 sm:h-11 sm:w-11 rounded-full bg-gradient-surface shadow-neu-raised-sm flex items-center justify-center hover:shadow-neu-raised active:shadow-neu-pressed-sm transition-shadow"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-4 sm:w-4 text-foreground/80" /> : <Moon className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-4 sm:w-4 text-foreground/80" />}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onBellClick}
          className="relative h-8 w-8 xs:h-9 xs:w-9 sm:h-11 sm:w-11 rounded-full bg-gradient-surface shadow-neu-raised-sm flex items-center justify-center hover:shadow-neu-raised active:shadow-neu-pressed-sm transition-shadow"
          aria-label="Notifications"
        >
          <Bell className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-4 sm:w-4 text-foreground/80" />
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-3.5 xs:h-4 xs:min-w-4 sm:h-5 sm:min-w-5 px-0.5 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground text-[7px] xs:text-[8px] sm:text-[10px] font-bold flex items-center justify-center shadow-neu-raised-sm">
              {notifCount}
            </span>
          )}
        </motion.button>
      </div>
    </header>
  );
};

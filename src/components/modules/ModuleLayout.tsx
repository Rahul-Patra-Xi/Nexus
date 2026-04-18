import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { LocationBar } from "@/components/location/LocationBar";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showLocation?: boolean;
};

export const ModuleLayout = ({ title, subtitle, children, showLocation = true }: Props) => {
  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6 pt-4">
      <div className="max-w-100 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full neu-pressed-sm text-sm font-medium text-foreground/80 mb-4 hover:shadow-neu-raised-sm transition-shadow"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </motion.header>

        {showLocation && (
          <div className="mb-6">
            <LocationBar />
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

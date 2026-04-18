import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const RequireUser = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav("/auth", { replace: true });
  }, [loading, user, nav]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-sm">Opening your workspace…</span>
      </div>
    );
  }

  return <>{children}</>;
};

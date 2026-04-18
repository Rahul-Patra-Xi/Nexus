import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { services, quickActions } from "@/data/mockData";
import { quickActionToPath, serviceToModulePath } from "@/lib/moduleRoutes";
import { User, Sparkles } from "lucide-react";

interface Props { open: boolean; onOpenChange: (v: boolean) => void; }

export const SearchDialog = ({ open, onOpenChange }: Props) => {
  const nav = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (path: string) => {
    onOpenChange(false);
    nav(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search services, actions, profile…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Services">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <CommandItem key={s.id} value={`${s.name} ${s.tagline}`} onSelect={() => go(serviceToModulePath(s.id) ?? `/service/${s.id}`)}>
                <Icon className="mr-2 h-4 w-4" />
                <span>{s.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{s.tagline}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandGroup heading="Quick actions">
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            return (
              <CommandItem key={qa.id} value={qa.label} onSelect={() => go(quickActionToPath(qa.service))}>
                <Icon className="mr-2 h-4 w-4" />
                {qa.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandGroup heading="Account">
          <CommandItem value="profile account settings" onSelect={() => go("/profile")}>
            <User className="mr-2 h-4 w-4" /> Your profile
          </CommandItem>
          <CommandItem value="smart plan ai bundle" onSelect={() => go("/mod/smart-plan")}>
            <Sparkles className="mr-2 h-4 w-4" /> Smart Plan (bundles)
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

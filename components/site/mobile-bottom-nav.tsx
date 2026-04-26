"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardEdit, BarChart3, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/participar", label: "Participar", icon: ClipboardEdit, primary: true },
  { href: "/resultados", label: "Resultados", icon: BarChart3 },
  { href: "/privacidad", label: "Privacidad", icon: ShieldCheck },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div aria-hidden className="h-0.5 flag-stripe" />
      <ul className="flex w-full">
        {NAV.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex min-w-0 flex-1">
              <Link
                href={item.href}
                className={cn(
                  "relative flex w-full flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-brand-deep" : "text-brand-muted",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full transition",
                    item.primary
                      ? active
                        ? "bg-brand-deep text-white"
                        : "bg-brand-accent text-brand-ink"
                      : active
                        ? "text-brand-deep"
                        : "text-brand-muted",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span
                  className={cn(
                    "max-w-full truncate",
                    active && "font-semibold",
                  )}
                >
                  {item.label}
                </span>
                {active && !item.primary ? (
                  <span
                    aria-hidden
                    className="absolute -top-px h-0.5 w-8 rounded-full bg-brand-deep"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

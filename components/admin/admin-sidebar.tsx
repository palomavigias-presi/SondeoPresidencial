"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  ClipboardList,
  Megaphone,
  Newspaper,
  UserSquare2,
  HelpCircle,
  Sparkles,
  Settings,
  ShieldCheck,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/participants", label: "Participantes", icon: Users },
  { href: "/admin/responses", label: "Respuestas", icon: ClipboardList },
  { href: "/admin/candidates", label: "Candidatos", icon: UserSquare2 },
  { href: "/admin/questions", label: "Preguntas", icon: HelpCircle },
  { href: "/admin/campaigns", label: "Campañas WhatsApp", icon: Megaphone },
  { href: "/admin/external-polls", label: "Encuestas externas", icon: Newspaper },
  { href: "/admin/ai", label: "Centro IA / propuestas", icon: Sparkles },
  { href: "/admin/audit", label: "Auditoría", icon: ShieldCheck },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
];

export function AdminSidebar({
  email,
  role,
}: {
  email: string;
  role: string;
}) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block">
      <div className="border-b border-slate-200 p-4">
        <p className="text-xs uppercase tracking-wider text-brand-muted">
          Panel admin
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-brand-text">
          {email}
        </p>
        <p className="text-xs capitalize text-brand-muted">{role.replace("_", " ")}</p>
      </div>
      <nav className="space-y-1 p-2">
        {NAV.map((n) => {
          const active =
            pathname === n.href || (n.href !== "/admin" && pathname.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-brand-deep text-white"
                  : "text-brand-text hover:bg-slate-100",
              )}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

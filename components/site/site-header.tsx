import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export function SiteHeader() {
  return (
    <>
      <div aria-hidden className="h-1 flag-stripe" />
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-brand-ink text-white shadow-glow">
              <span className="font-mono text-sm font-bold tracking-tight">PC</span>
              <span
                aria-hidden
                className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brand-accent ring-2 ring-white"
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-brand-deep">{SITE_NAME}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">
                Sondeo ciudadano · 2026
              </p>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
            <NavLink href="/">Inicio</NavLink>
            <NavLink href="/resultados">Resultados</NavLink>
            <NavLink href="/privacidad">Privacidad</NavLink>
            <Link
              href="/participar"
              className="ml-2 inline-flex items-center gap-1.5 rounded-md bg-brand-deep px-4 py-2 text-sm font-semibold text-white shadow-glow hover:bg-brand-blue transition-colors"
            >
              Participar
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-brand-accent"
              />
            </Link>
          </nav>
          <Link
            href="/participar"
            className="rounded-md bg-brand-deep px-3 py-1.5 text-sm font-semibold text-white shadow-sm md:hidden"
          >
            Participar
          </Link>
        </div>
      </header>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 text-brand-text transition-colors hover:bg-slate-100 hover:text-brand-deep"
    >
      {children}
    </Link>
  );
}

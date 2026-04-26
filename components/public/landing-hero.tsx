import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, ShieldCheck, Sparkles } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-hero-gradient">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-50" />
      <div
        aria-hidden
        className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-accent/30 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brand-blue/20 blur-3xl"
      />

      <div className="container-page relative grid gap-10 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-deep/15 bg-white/80 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-brand-deep backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5" />
            Participación ciudadana · Datos protegidos
          </span>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-brand-deep md:text-6xl">
            Sondeo ciudadano{" "}
            <span className="text-gradient-flag">presidencial 2026</span>
          </h1>
          <p className="pretty mt-5 max-w-xl text-base text-brand-muted md:text-lg">
            Una medición ciudadana <strong className="text-brand-text">transparente</strong> sobre
            la primera vuelta presidencial en Colombia. Tus datos se tratan con
            autorización previa y los resultados públicos son agregados.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="xl"
              className="group font-semibold shadow-glow"
            >
              <Link href="/participar">
                Responder sondeo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link href="/resultados">
                <BarChart3 className="h-4 w-4" />
                Ver resultados agregados
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-widest text-brand-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Toma 2 min
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
              6 preguntas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
              Anónimo · agregado
            </span>
          </div>
        </div>

        <HeroPanel />
      </div>
    </section>
  );
}

function HeroPanel() {
  const steps = [
    { num: "01", txt: "Respondes 6 preguntas" },
    { num: "02", txt: "Registras tu identidad" },
    { num: "03", txt: "Ves resultados agregados" },
    { num: "04", txt: "Compartes tu enlace" },
  ];
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-accent/30 via-transparent to-brand-blue/30 blur-2xl"
      />
      <div className="relative rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-glow backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">
            Cómo funciona
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-brand-deep">
            <Sparkles className="h-3 w-3" /> En vivo
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {steps.map((s) => (
            <div
              key={s.num}
              className="rounded-xl border border-slate-200 bg-brand-bg p-4 transition hover:border-brand-deep/30 hover:bg-white"
            >
              <p className="mono-stat text-xs uppercase tracking-widest text-brand-accentDark">
                {s.num}
              </p>
              <p className="mt-1 text-sm font-semibold text-brand-text">
                {s.txt}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg bg-brand-ink p-3 text-white">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand-accent">
              Privacidad
            </p>
            <p className="text-xs">
              Resultados solo agregados · datos cifrados
            </p>
          </div>
          <ShieldCheck className="h-5 w-5 text-brand-accent" />
        </div>
      </div>
    </div>
  );
}

import { ShieldCheck, EyeOff, RotateCcw } from "lucide-react";

const ITEMS = [
  {
    icon: ShieldCheck,
    title: "Datos con autorización previa",
    desc: "Aplicamos los principios de la Ley 1581 de 2012 y el Decreto 1377 de 2013 sobre tratamiento de datos personales.",
    accent: "blue",
  },
  {
    icon: EyeOff,
    title: "Resultados agregados",
    desc: "Las respuestas individuales nunca son públicas. Solo se publican totales y porcentajes por candidato, tema y región.",
    accent: "yellow",
  },
  {
    icon: RotateCcw,
    title: "Derecho a rectificar y eliminar",
    desc: "Puedes solicitar consulta, actualización o eliminación de tus datos cuando quieras desde un formulario público.",
    accent: "red",
  },
] as const;

const ACCENTS: Record<"blue" | "yellow" | "red", string> = {
  blue: "bg-brand-blue/10 text-brand-blue",
  yellow: "bg-brand-accent/15 text-brand-accentDark",
  red: "bg-brand-red/10 text-brand-red",
};

export function TrustBadges() {
  return (
    <section className="container-page py-14">
      <div className="grid gap-4 md:grid-cols-3">
        {ITEMS.map((it) => (
          <div
            key={it.title}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition hover:border-brand-deep/30 hover:shadow-glow"
          >
            <div
              className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${ACCENTS[it.accent]}`}
            >
              <it.icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-brand-text">
              {it.title}
            </h3>
            <p className="mt-2 text-sm text-brand-muted">{it.desc}</p>
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-brand-deep transition-transform group-hover:scale-x-100"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

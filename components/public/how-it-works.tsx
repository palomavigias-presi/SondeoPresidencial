const STEPS = [
  {
    n: "01",
    title: "Respondes el sondeo",
    desc: "Seis preguntas en menos de 2 minutos. Sin pedir datos personales hasta el final.",
  },
  {
    n: "02",
    title: "Registras nombre y WhatsApp",
    desc: "Solo nombre y WhatsApp son obligatorios. Lo demás es opcional y mejora la representatividad.",
  },
  {
    n: "03",
    title: "Ves resultados agregados",
    desc: "Visualizas la tendencia general por candidato, tema, región y nivel de decisión.",
  },
  {
    n: "04",
    title: "Compartes tu enlace",
    desc: "Recibes un link personal para invitar a otras personas a participar y ampliar la muestra.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden border-y border-slate-200 bg-white py-16">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <div className="container-page relative">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-brand-deep">
            Cómo funciona
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-brand-deep md:text-4xl">
            Un flujo simple, transparente y mobile-first
          </h2>
          <p className="mt-3 text-base text-brand-muted">
            El orden está pensado para minimizar la fricción: primero opinas,
            luego decides si registrar tu identidad.
          </p>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-4">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="relative rounded-xl border border-slate-200 bg-brand-bg p-6 transition hover:-translate-y-0.5 hover:border-brand-deep/30 hover:bg-white hover:shadow-glow"
            >
              <p className="mono-stat text-xs uppercase tracking-widest text-brand-accentDark">
                {s.n}
              </p>
              <h3 className="mt-3 text-base font-semibold text-brand-text">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-brand-muted">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

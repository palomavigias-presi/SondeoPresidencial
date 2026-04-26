import { TRANSPARENCY_DISCLAIMER } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";

interface TransparencyBlockProps {
  totalParticipants: number;
  totalResponses: number;
  totalDepartments: number;
  startDate: string;
}

export function TransparencyBlock({
  totalParticipants,
  totalResponses,
  totalDepartments,
  startDate,
}: TransparencyBlockProps) {
  return (
    <section className="container-page py-16">
      <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-brand-deep">
            Ficha técnica
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-brand-deep md:text-4xl">
            Transparencia primero
          </h2>
          <p className="mt-3 text-sm text-brand-muted">
            {TRANSPARENCY_DISCLAIMER}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-brand-ink p-6 text-white shadow-glow">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand-accent">
              Datos del sondeo
            </p>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/60">
              Actualización · automática
            </span>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-5 text-sm">
            <Stat label="Inicio" value={startDate} />
            <Stat label="Método" value="Digital · autoadministrado" />
            <Stat
              label="Personas registradas"
              value={formatNumber(totalParticipants)}
              big
            />
            <Stat
              label="Respuestas completadas"
              value={formatNumber(totalResponses)}
              big
            />
            <Stat
              label="Departamentos cubiertos"
              value={formatNumber(totalDepartments)}
              big
            />
            <Stat label="Tipo de muestra" value="No probabilística · voluntaria" />
          </dl>
          <div aria-hidden className="mt-6 h-1 flag-stripe rounded-full" />
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  big,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-white/50">
        {label}
      </dt>
      <dd
        className={
          big
            ? "mono-stat mt-1 text-2xl font-semibold text-white"
            : "mt-1 text-sm font-medium text-white"
        }
      >
        {value}
      </dd>
    </div>
  );
}

import { MapPin, Users, AlertCircle } from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/utils";
import { REGIONS, type Region } from "@/lib/constants";
import { DEPARTMENTS, DEPARTMENT_REGION } from "@/lib/colombia-geo";
import { ColombiaMap } from "./colombia-map";

export interface RegionRow {
  region: string;
  total: number;
}

export interface DepartmentRow {
  department: string;
  total: number;
}

interface Props {
  byRegion: RegionRow[];
  byDepartment: DepartmentRow[];
  totalParticipants: number;
}

const REGION_COLORS: Record<Region, { dot: string; bar: string; bg: string }> = {
  Caribe:           { dot: "bg-amber-400",   bar: "bg-amber-400",   bg: "bg-amber-50" },
  Andina:           { dot: "bg-brand-blue",  bar: "bg-brand-blue",  bg: "bg-blue-50" },
  Pacífica:         { dot: "bg-emerald-500", bar: "bg-emerald-500", bg: "bg-emerald-50" },
  Orinoquía:        { dot: "bg-orange-500",  bar: "bg-orange-500",  bg: "bg-orange-50" },
  Amazonía:         { dot: "bg-green-700",   bar: "bg-green-700",   bg: "bg-green-50" },
  "Bogotá D.C.":    { dot: "bg-brand-deep",  bar: "bg-brand-deep",  bg: "bg-slate-50" },
  Insular:          { dot: "bg-cyan-500",    bar: "bg-cyan-500",    bg: "bg-cyan-50" },
};

const NO_LOCATION_KEYS = new Set([
  "Sin región informada",
  "Sin departamento informado",
]);

export function CoverageMap({
  byRegion,
  byDepartment,
  totalParticipants,
}: Props) {
  const regionTotals = new Map<string, number>();
  let sinRegion = 0;
  for (const r of byRegion) {
    if (NO_LOCATION_KEYS.has(r.region)) {
      sinRegion += Number(r.total);
    } else {
      regionTotals.set(r.region, Number(r.total));
    }
  }

  const departmentTotals = new Map<string, number>();
  let sinDepartamento = 0;
  for (const d of byDepartment) {
    if (NO_LOCATION_KEYS.has(d.department)) {
      sinDepartamento += Number(d.total);
    } else {
      departmentTotals.set(d.department, Number(d.total));
    }
  }

  const regionsSorted = REGIONS
    .map((r) => ({ region: r, total: regionTotals.get(r) ?? 0 }))
    .sort((a, b) => b.total - a.total);

  const maxRegion = regionsSorted[0]?.total ?? 0;

  // Para el heatmap por departamento ordenamos por total y mostramos top primero
  const allDepts = DEPARTMENTS.map((d) => ({
    department: d,
    total: departmentTotals.get(d) ?? 0,
    region: DEPARTMENT_REGION[d] ?? null,
  }));
  const maxDept = Math.max(1, ...allDepts.map((d) => d.total));
  const sortedDepts = [...allDepts].sort((a, b) => b.total - a.total);

  const reportedTotal = totalParticipants - sinRegion;
  const sinPct =
    totalParticipants > 0 ? sinRegion / totalParticipants : 0;

  return (
    <section className="relative overflow-hidden border-y border-slate-200 bg-white py-16">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <div className="container-page relative">
        <header className="mb-10 max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-brand-deep">
            Cobertura territorial · en vivo
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-brand-deep md:text-4xl">
            ¿Cómo va la participación en el país?
          </h2>
          <p className="mt-3 text-sm text-brand-muted md:text-base">
            Mapa agregado de quiénes han respondido el sondeo, por región y por
            departamento. Las personas que no compartieron su ubicación
            aparecen en una fila separada — su voz también cuenta.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <RegionPanel
            rows={regionsSorted}
            max={maxRegion}
            total={totalParticipants}
            sinRegion={sinRegion}
            sinPct={sinPct}
            reportedTotal={reportedTotal}
          />
          <SinLocationPanel
            sinRegion={sinRegion}
            sinDepartamento={sinDepartamento}
            totalParticipants={totalParticipants}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <ColombiaMap
            data={sortedDepts.filter((d) => d.total > 0).map((d) => ({
              department: d.department,
              total: d.total,
            }))}
            totalParticipants={totalParticipants}
          />
          <DepartmentRanking
            rows={sortedDepts}
            sinDepartamento={sinDepartamento}
            totalParticipants={totalParticipants}
          />
        </div>
      </div>
    </section>
  );
}

function RegionPanel({
  rows,
  max,
  total,
  sinRegion,
  sinPct,
  reportedTotal,
}: {
  rows: Array<{ region: string; total: number }>;
  max: number;
  total: number;
  sinRegion: number;
  sinPct: number;
  reportedTotal: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-glow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-brand-deep/10 text-brand-deep">
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">
              Macro-regiones
            </p>
            <h3 className="text-base font-semibold text-brand-text">
              Las 7 regiones de Colombia
            </h3>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-emerald-700">
          Vivo
        </span>
      </div>

      <ul className="mt-5 space-y-2.5">
        {rows.map(({ region, total }) => {
          const colors = REGION_COLORS[region as Region];
          const pct = max > 0 ? total / max : 0;
          const ofTotalPct = reportedTotal > 0 ? total / reportedTotal : 0;
          return (
            <li key={region}>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-brand-text">
                  <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                  {region}
                </span>
                <span className="mono-stat text-xs text-brand-muted">
                  {formatNumber(total)}
                  {total > 0 ? (
                    <span className="ml-1 text-brand-deep/70">
                      · {formatPercent(ofTotalPct)}
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${colors.bar}`}
                  style={{ width: `${Math.max(pct * 100, total > 0 ? 4 : 0)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex items-center justify-between rounded-md border border-slate-200 bg-brand-bg px-3 py-2 text-xs">
        <span className="text-brand-muted">
          Total de participantes registrados
        </span>
        <span className="mono-stat font-semibold text-brand-deep">
          {formatNumber(total)}
        </span>
      </div>
      {sinRegion > 0 ? (
        <p className="mt-2 text-xs text-brand-muted">
          De ellos, <strong className="text-brand-text">{formatNumber(sinRegion)}</strong>{" "}
          ({formatPercent(sinPct)}) no informaron su región — se cuentan aparte.
        </p>
      ) : null}
    </div>
  );
}

function SinLocationPanel({
  sinRegion,
  sinDepartamento,
  totalParticipants,
}: {
  sinRegion: number;
  sinDepartamento: number;
  totalParticipants: number;
}) {
  const total = totalParticipants;
  const totalPct = total > 0 ? sinDepartamento / total : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-brand-ink p-6 text-white shadow-glow">
      <div aria-hidden className="absolute inset-0 bg-grid-dark opacity-50" />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-brand-accent">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-brand-accent">
              Participantes sin ubicación
            </p>
            <h3 className="text-base font-semibold">Su voz también cuenta</h3>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <Metric
            label="Sin departamento"
            value={formatNumber(sinDepartamento)}
            secondary={
              total > 0 ? `${formatPercent(totalPct)} del total` : undefined
            }
          />
          <Metric
            label="Sin región"
            value={formatNumber(sinRegion)}
            secondary={
              total > 0
                ? `${formatPercent(total > 0 ? sinRegion / total : 0)} del total`
                : undefined
            }
          />
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-md border border-white/10 bg-white/5 p-3 text-xs text-white/80">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-none text-brand-accent" />
          <span>
            Los datos territoriales son <strong className="text-white">opcionales</strong>.
            Quienes no los compartieron siguen contando en el agregado nacional,
            pero no aparecen en el desglose por región o departamento.
          </span>
        </div>

        <div aria-hidden className="mt-5 h-1 flag-stripe rounded-full" />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string;
  secondary?: string;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">
        {label}
      </p>
      <p className="mono-stat mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      {secondary ? (
        <p className="text-[11px] text-white/60">{secondary}</p>
      ) : null}
    </div>
  );
}

function DepartmentRanking({
  rows,
  sinDepartamento,
  totalParticipants,
}: {
  rows: Array<{ department: string; total: number; region: Region | null }>;
  sinDepartamento: number;
  totalParticipants: number;
}) {
  const top = rows.filter((r) => r.total > 0).slice(0, 10);
  const rest = rows.filter((r) => r.total === 0);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-glow">
      <p className="font-mono text-[10px] uppercase tracking-widest text-brand-deep">
        Ranking
      </p>
      <h3 className="text-base font-semibold text-brand-text">
        Top departamentos
      </h3>
      <p className="mt-1 text-xs text-brand-muted">
        Por volumen de respuestas. Mismos datos que el mapa, en lista compacta.
      </p>

      <ol className="mt-4 space-y-1.5 text-sm">
        {top.length === 0 ? (
          <li className="rounded-md border border-dashed border-slate-200 p-3 text-xs text-brand-muted">
            Aún no hay departamentos con respuestas registradas.
          </li>
        ) : (
          top.map((r, i) => {
            const pct = totalParticipants > 0 ? r.total / totalParticipants : 0;
            return (
              <li
                key={r.department}
                className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-1.5"
              >
                <span className="mono-stat w-5 shrink-0 text-center text-[10px] font-semibold text-brand-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 truncate font-medium text-brand-text">
                  {r.department}
                </span>
                <span className="mono-stat shrink-0 text-xs text-brand-deep">
                  {formatNumber(r.total)}
                  <span className="ml-1 text-[10px] text-brand-muted">
                    {formatPercent(pct)}
                  </span>
                </span>
              </li>
            );
          })
        )}
      </ol>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-center justify-between rounded-md border border-dashed border-amber-300 bg-amber-50/60 p-2.5">
          <span className="font-medium text-amber-900">
            Sin departamento informado
          </span>
          <span className="mono-stat font-semibold text-amber-900">
            {formatNumber(sinDepartamento)}
          </span>
        </div>
        {rest.length > 0 ? (
          <p className="text-[11px] text-brand-muted">
            <span className="mono-stat font-semibold">{rest.length}</span>{" "}
            departamentos aún sin respuestas registradas.
          </p>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ColombiaMap } from "./colombia-map";
import { formatNumber, formatPercent } from "@/lib/utils";

interface DepartmentRow {
  department: string;
  total: number;
}

export interface CandidateResultRow {
  option_id: string;
  option_text: string;
  total: number;
  candidate_id: string | null;
}

interface Props {
  byDepartment: DepartmentRow[];
  candidates: CandidateResultRow[];
  totalParticipants: number;
}

const PALETTE = [
  "#0D1B4B", // azul institucional
  "#003893", // azul Colombia
  "#FFCD00", // amarillo bandera
  "#CE1126", // rojo bandera
  "#0E9E6A", // verde
  "#7E2D8E", // morado
  "#22D3EE", // cian
  "#D4A017", // dorado
  "#9CA3AF", // gris
];

export function ResultsHeadline({
  byDepartment,
  candidates,
  totalParticipants,
}: Props) {
  const totalVotes = candidates.reduce((s, c) => s + c.total, 0);
  const sorted = [...candidates].sort((a, b) => b.total - a.total);

  return (
    <section className="space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-brand-deep">
          Vista principal · datos en vivo
        </p>
        <h2 className="mt-2 text-balance text-xl font-semibold tracking-tight text-brand-deep sm:text-2xl md:text-3xl">
          Mapa nacional e intención de voto
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-brand-muted">
          Cobertura territorial y los totales de la pregunta principal del
          sondeo: si la primera vuelta presidencial fuera hoy, ¿por quién
          votarían los participantes?
        </p>
      </div>

      <ColombiaMap
        data={byDepartment}
        totalParticipants={totalParticipants}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <BarPanel rows={sorted} totalVotes={totalVotes} />
        <PiePanel rows={sorted} totalVotes={totalVotes} />
      </div>
    </section>
  );
}

function BarPanel({
  rows,
  totalVotes,
}: {
  rows: CandidateResultRow[];
  totalVotes: number;
}) {
  const data = rows.map((r) => ({
    name: shortName(r.option_text),
    full: r.option_text,
    total: r.total,
    pct: totalVotes > 0 ? r.total / totalVotes : 0,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-glow">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-deep">
            Totales · barras
          </p>
          <h3 className="text-base font-semibold text-brand-text">
            Intención de voto
          </h3>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-emerald-700">
          {formatNumber(totalVotes)} votos
        </span>
      </div>

      {totalVotes === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 4, right: 16, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" stroke="#94A3B8" fontSize={10} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#94A3B8"
                fontSize={10}
                width={110}
                tickMargin={2}
              />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload && payload.length ? (
                    <CustomTooltip
                      label={(payload[0].payload as { full: string }).full}
                      total={Number(payload[0].value)}
                      pct={(payload[0].payload as { pct: number }).pct}
                    />
                  ) : null
                }
                cursor={{ fill: "#F1F5F9" }}
              />
              <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function PiePanel({
  rows,
  totalVotes,
}: {
  rows: CandidateResultRow[];
  totalVotes: number;
}) {
  const data = rows.map((r) => ({
    name: shortName(r.option_text),
    full: r.option_text,
    value: r.total,
    pct: totalVotes > 0 ? r.total / totalVotes : 0,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-glow">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-deep">
            Totales · distribución
          </p>
          <h3 className="text-base font-semibold text-brand-text">
            Distribución porcentual
          </h3>
        </div>
        <span className="rounded-full bg-brand-deep/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-brand-deep">
          {rows.length} opciones
        </span>
      </div>

      {totalVotes === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr] lg:grid-cols-1 xl:grid-cols-[1fr_1fr]">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  stroke="#fff"
                  strokeWidth={1}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload && payload.length ? (
                      <CustomTooltip
                        label={(payload[0].payload as { full: string }).full}
                        total={Number(payload[0].value)}
                        pct={(payload[0].payload as { pct: number }).pct}
                      />
                    ) : null
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1 text-xs">
            {data.map((d, i) => (
              <li
                key={d.name}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-2 py-1.5"
              >
                <span className="flex items-center gap-2 truncate">
                  <span
                    className="h-3 w-3 shrink-0 rounded-sm"
                    style={{ background: PALETTE[i % PALETTE.length] }}
                  />
                  <span className="truncate font-medium text-brand-text">
                    {d.full}
                  </span>
                </span>
                <span className="mono-stat shrink-0 text-brand-deep">
                  {formatPercent(d.pct)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function CustomTooltip({
  label,
  total,
  pct,
}: {
  label: string;
  total: number;
  pct: number;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-brand-ink p-2.5 text-xs text-white shadow-glow">
      <p className="font-semibold">{label}</p>
      <p className="mono-stat mt-1 text-base">
        {formatNumber(total)}
        <span className="ml-1 text-[10px] text-white/60">votos</span>
      </p>
      <p className="font-mono text-[10px] text-brand-accent">
        {formatPercent(pct)} del total
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-4 flex h-48 items-center justify-center rounded-md border border-dashed border-slate-200 bg-brand-bg p-6 text-center text-xs text-brand-muted">
      Aún no hay respuestas registradas. Las gráficas se llenan en tiempo real
      a medida que las personas completan el sondeo.
    </div>
  );
}

function shortName(s: string, max = 16): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

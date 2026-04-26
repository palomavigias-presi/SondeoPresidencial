"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatPercent } from "@/lib/utils";

const COLORS = [
  "#0D1B4B",
  "#C0182B",
  "#D4A017",
  "#1F5BB8",
  "#2BB673",
  "#7E2D8E",
  "#0E9E6A",
  "#6B7280",
  "#9CA3AF",
];

export interface PublicResultRow {
  question_id: string;
  question_text: string;
  option_id: string | null;
  option_text: string | null;
  candidate_id: string | null;
  total: number;
}

export interface DepartmentRow {
  department: string;
  total: number;
}

export interface DayRow {
  day: string;
  total: number;
}

interface Props {
  byQuestion: PublicResultRow[];
  byDepartment: DepartmentRow[];
  byDay: DayRow[];
  summary: {
    total_participants: number;
    total_responses_completed: number;
    total_departments: number;
    total_municipalities: number;
  };
}

export function ResultsDashboard({
  byQuestion,
  byDepartment,
  byDay,
  summary,
}: Props) {
  const grouped = useMemo(() => groupByQuestion(byQuestion), [byQuestion]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Participantes" value={summary.total_participants} />
        <StatCard label="Respuestas completas" value={summary.total_responses_completed} />
        <StatCard label="Departamentos" value={summary.total_departments} />
        <StatCard label="Municipios" value={summary.total_municipalities} />
      </div>

      {grouped.map((g) => (
        <QuestionCard key={g.question_id} group={g} />
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Top 12 departamentos por participación</CardTitle>
          <CardDescription>
            Total de personas registradas, ordenado descendente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byDepartment.slice(0, 12)}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" stroke="#94A3B8" fontSize={12} />
                <YAxis
                  dataKey="department"
                  type="category"
                  stroke="#94A3B8"
                  fontSize={12}
                  width={120}
                />
                <Tooltip />
                <Bar dataKey="total" fill="#0D1B4B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participación por día</CardTitle>
          <CardDescription>Últimos 60 días.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#C0182B"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface QuestionGroup {
  question_id: string;
  question_text: string;
  options: Array<{ option_id: string; option_text: string; total: number }>;
  total: number;
}

function groupByQuestion(rows: PublicResultRow[]): QuestionGroup[] {
  const map = new Map<string, QuestionGroup>();
  for (const r of rows) {
    if (!r.option_id || !r.option_text) continue;
    const g = map.get(r.question_id) ?? {
      question_id: r.question_id,
      question_text: r.question_text,
      options: [],
      total: 0,
    };
    g.options.push({
      option_id: r.option_id,
      option_text: r.option_text,
      total: Number(r.total),
    });
    g.total += Number(r.total);
    map.set(r.question_id, g);
  }
  return Array.from(map.values());
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-brand-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-brand-deep">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function QuestionCard({ group }: { group: QuestionGroup }) {
  const [view, setView] = useState<"bar" | "pie">("bar");
  const data = group.options
    .map((o) => ({
      ...o,
      pct: group.total > 0 ? o.total / group.total : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">{group.question_text}</CardTitle>
          <CardDescription>
            {group.total > 0
              ? `${formatNumber(group.total)} respuestas`
              : "Aún no hay respuestas"}
          </CardDescription>
        </div>
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => setView("bar")}
            className={`rounded-md px-2 py-1 ${view === "bar" ? "bg-brand-deep text-white" : "bg-slate-100 text-brand-muted"}`}
          >
            Barras
          </button>
          <button
            onClick={() => setView("pie")}
            className={`rounded-md px-2 py-1 ${view === "pie" ? "bg-brand-deep text-white" : "bg-slate-100 text-brand-muted"}`}
          >
            Torta
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {group.total === 0 ? (
          <p className="text-sm text-brand-muted">
            Aún no hay datos suficientes para mostrar.
          </p>
        ) : view === "bar" ? (
          <div className="space-y-2">
            {data.map((o, i) => (
              <div key={o.option_id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-brand-text">{o.option_text}</span>
                  <span className="tabular-nums text-brand-muted">
                    {formatNumber(o.total)} · {formatPercent(o.pct)}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${o.pct * 100}%`,
                      background: COLORS[i % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="option_text"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

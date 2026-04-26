import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber, formatPercent } from "@/lib/utils";
import Link from "next/link";

const PAGE_SIZE = 30;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ResponsesPage({ searchParams }: PageProps) {
  await requireAdmin("viewer");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createSupabaseServerClient();
  const [resultsRes, recentRes] = await Promise.all([
    supabase.from("v_public_results").select("*"),
    supabase
      .from("survey_responses")
      .select(
        "id, completed, completed_at, created_at, participant_id, profile_summary, participants(full_name, department, region)",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1),
  ]);

  const grouped = groupByQuestion(
    (resultsRes.data ?? []).map((r) => ({
      question_id: r.question_id ?? "",
      question_text: r.question_text ?? "",
      option_id: r.option_id,
      option_text: r.option_text,
      total: Number(r.total ?? 0),
    })),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-brand-deep">Respuestas</h1>
        <p className="text-sm text-brand-muted">
          Resultados agregados en vivo y listado de respuestas individuales (auditoría).
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {grouped.map((g) => (
          <Card key={g.question_id}>
            <CardHeader>
              <CardTitle className="text-base">{g.question_text}</CardTitle>
              <CardDescription>{formatNumber(g.total)} respuestas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {g.options.map((o) => (
                <div key={o.option_id}>
                  <div className="flex items-center justify-between">
                    <span>{o.option_text}</span>
                    <span className="font-mono text-brand-muted">
                      {formatNumber(o.total)} · {formatPercent(g.total > 0 ? o.total / g.total : 0)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-brand-deep"
                      style={{
                        width: `${g.total > 0 ? (o.total / g.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Respuestas recientes</CardTitle>
          <CardDescription>
            Últimas respuestas. La info personal se respeta según el rol del administrador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Participante</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(recentRes.data ?? []).map((r) => {
                const p = (r as unknown as { participants: { full_name: string; department: string } | null }).participants;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs text-brand-muted">
                      {formatDate(r.created_at)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/participants/${r.participant_id}`}
                        className="text-brand-deep hover:underline"
                      >
                        {p?.full_name ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell>{p?.department ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={r.completed ? "success" : "muted"}>
                        {r.completed ? "Completa" : "Parcial"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

interface QGroup {
  question_id: string;
  question_text: string;
  options: Array<{ option_id: string; option_text: string; total: number }>;
  total: number;
}

function groupByQuestion(rows: Array<{ question_id: string; question_text: string; option_id: string | null; option_text: string | null; total: number }>): QGroup[] {
  const map = new Map<string, QGroup>();
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

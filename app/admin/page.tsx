import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [
    summary,
    optInRes,
    deptCountsRes,
    topQ1Res,
    topQ2Res,
    byDayRes,
    referralsRes,
    activeCampaignsRes,
    topReferrersRes,
  ] = await Promise.all([
    supabase.from("v_public_summary").select("*").maybeSingle(),
    supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .eq("consent_whatsapp", true),
    supabase.from("participants").select("department"),
    supabase
      .from("v_public_results")
      .select("question_text, option_text, total")
      .order("total", { ascending: false }),
    supabase
      .from("v_public_results")
      .select("question_text, option_text, total"),
    supabase.from("v_participation_by_day").select("*"),
    supabase.from("referral_events").select("id", { count: "exact", head: true }),
    supabase
      .from("campaigns")
      .select("id, name, status")
      .in("status", ["ready", "sent"]),
    supabase
      .from("referral_events")
      .select("parent_participant_id"),
  ]);

  const totalParticipants = Number(summary.data?.total_participants ?? 0);
  const totalCompleted = Number(summary.data?.total_responses_completed ?? 0);
  const totalIncomplete = Number(summary.data?.total_responses_partial ?? 0);
  const conversion =
    totalParticipants > 0 ? totalCompleted / totalParticipants : 0;
  const optIn = optInRes.count ?? 0;

  const deptMap = new Map<string, number>();
  for (const p of deptCountsRes.data ?? []) {
    deptMap.set(p.department, (deptMap.get(p.department) ?? 0) + 1);
  }
  const topDepts = Array.from(deptMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topVote = (topQ1Res.data ?? []).find((r) =>
    r.question_text?.startsWith("Si la primera vuelta"),
  );
  const topTopic = (topQ2Res.data ?? [])
    .filter((r) => r.question_text?.startsWith("¿Qué tema"))
    .sort((a, b) => Number(b.total) - Number(a.total))[0];

  const referrerCounts = new Map<string, number>();
  for (const r of topReferrersRes.data ?? []) {
    referrerCounts.set(
      r.parent_participant_id,
      (referrerCounts.get(r.parent_participant_id) ?? 0) + 1,
    );
  }
  const topReferrerIds = Array.from(referrerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const refIdList = topReferrerIds.map(([id]) => id);
  const { data: refDetails } = refIdList.length
    ? await supabase
        .from("participants")
        .select("id, full_name, department")
        .in("id", refIdList)
    : { data: [] as Array<{ id: string; full_name: string; department: string }> };

  const refRows = topReferrerIds.map(([id, count]) => {
    const p = refDetails?.find((d) => d.id === id);
    return {
      id,
      name: p?.full_name ?? "—",
      department: p?.department ?? "—",
      count,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-brand-deep">Dashboard general</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Vista global del sondeo. Los datos se actualizan en tiempo real desde Supabase.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Registrados" value={totalParticipants} />
        <Stat label="Respuestas completas" value={totalCompleted} />
        <Stat label="Respuestas parciales" value={totalIncomplete} />
        <Stat
          label="Tasa de conversión"
          value={`${(conversion * 100).toFixed(1)}%`}
        />
        <Stat label="Opt-in WhatsApp" value={optIn} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 departamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {topDepts.length === 0 ? (
                <li className="text-brand-muted">Sin datos aún.</li>
              ) : (
                topDepts.map(([d, n]) => (
                  <li key={d} className="flex items-center justify-between">
                    <span>{d}</span>
                    <span className="font-mono text-brand-muted">
                      {formatNumber(n)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Indicadores clave</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <KeyVal
              label="Candidato con mayor intención"
              value={topVote?.option_text ?? "—"}
              hint={topVote ? `${formatNumber(Number(topVote.total))} votos` : ""}
            />
            <KeyVal
              label="Tema prioritario más mencionado"
              value={topTopic?.option_text ?? "—"}
              hint={topTopic ? `${formatNumber(Number(topTopic.total))} menciones` : ""}
            />
            <KeyVal
              label="Eventos de referido"
              value={formatNumber(Number(referralsRes.count ?? 0))}
            />
            <KeyVal
              label="Campañas activas"
              value={formatNumber(activeCampaignsRes.data?.length ?? 0)}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 5 referidores</CardTitle>
        </CardHeader>
        <CardContent>
          {refRows.length === 0 ? (
            <p className="text-sm text-brand-muted">
              Aún no hay referidos registrados.
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              {refRows.map((r) => (
                <Link
                  key={r.id}
                  href={`/admin/participants/${r.id}`}
                  className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-brand-text">{r.name}</p>
                    <p className="text-xs text-brand-muted">{r.department}</p>
                  </div>
                  <Badge variant="outline">{r.count} referidos</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registros por día (últimos 60)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 sm:grid-cols-14">
            {(byDayRes.data ?? []).slice(-30).map((d) => (
              <div key={d.day} className="text-center" title={`${d.day}: ${d.total}`}>
                <div
                  className="mx-auto h-10 w-full rounded-sm"
                  style={{
                    background: `rgba(13,27,75,${Math.min(0.15 + Number(d.total) / 50, 1)})`,
                  }}
                />
                <p className="mt-1 text-[10px] text-brand-muted">
                  {String(d.day).slice(5)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-brand-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-deep">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
    </div>
  );
}

function KeyVal({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-brand-muted">{label}</span>
      <div className="text-right">
        <p className="font-medium">{value}</p>
        {hint ? <p className="text-xs text-brand-muted">{hint}</p> : null}
      </div>
    </div>
  );
}

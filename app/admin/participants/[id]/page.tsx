import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  anonymizeParticipantAction,
  deleteParticipantAction,
  markDoNotContactAction,
} from "../actions";

export default async function ParticipantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin("viewer");
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: p } = await supabase
    .from("participants")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!p) notFound();

  const { data: responses } = await supabase
    .from("survey_responses")
    .select("id, completed, profile_summary, created_at, completed_at")
    .eq("participant_id", id)
    .order("created_at", { ascending: false });

  const { data: refs } = await supabase
    .from("referral_events")
    .select("child_participant_id, created_at, participants:child_participant_id(full_name, department)")
    .eq("parent_participant_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: parent } = p.referred_by
    ? await supabase
        .from("participants")
        .select("id, full_name")
        .eq("id", p.referred_by)
        .maybeSingle()
    : { data: null };

  // Respuestas detalladas (texto de pregunta + texto de opción)
  const responseIds = (responses ?? []).map((r) => r.id);
  const { data: detailedAnswers } = responseIds.length
    ? await supabase
        .from("survey_answers")
        .select(
          "response_id, answer_text, created_at, survey_questions(question_text, display_order, is_sensitive), survey_options(option_text)",
        )
        .in("response_id", responseIds)
    : { data: [] };

  type DetailedAnswer = {
    response_id: string;
    answer_text: string | null;
    created_at: string;
    survey_questions: {
      question_text: string;
      display_order: number;
      is_sensitive: boolean;
    } | null;
    survey_options: { option_text: string } | null;
  };
  const sortedAnswers = ((detailedAnswers ?? []) as unknown as DetailedAnswer[]).slice().sort(
    (a, b) => (a.survey_questions?.display_order ?? 0) - (b.survey_questions?.display_order ?? 0),
  );

  // Eventos de share + audit logs relacionados
  const [{ data: shareEvents }, { data: auditEvents }] = await Promise.all([
    supabase
      .from("share_events")
      .select("id, channel, referral_code, created_at")
      .eq("participant_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("audit_logs")
      .select("id, action, entity, metadata, created_at, profiles(email)")
      .eq("entity_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/participants" className="text-sm text-brand-muted hover:underline">
          ← Volver a participantes
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold text-brand-deep">{p.full_name}</h1>
          {p.source === "simulated" ? (
            <Badge variant="accent">Registro simulado</Badge>
          ) : (
            <Badge variant="success">Registro real</Badge>
          )}
        </div>
        <p className="text-sm text-brand-muted">
          Registrado {formatDate(p.created_at)} · ID{" "}
          <code className="text-xs">{p.id.slice(0, 8)}</code>
        </p>
        {p.source === "simulated" ? (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <strong>Aviso:</strong> este registro es <strong>simulado</strong>{" "}
            (semilla de prueba). No tiene consentimiento real, los datos son
            generados aleatoriamente y no representa a una persona física.
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos básicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row k="WhatsApp" v={p.whatsapp} />
            <Row
              k="Ubicación"
              v={
                p.department || p.municipality
                  ? `${p.municipality || "—"}, ${p.department || "—"} · ${p.region || "—"}`
                  : "Sin ubicación informada"
              }
            />
            <Row k="Edad" v={p.age_range ?? "—"} />
            <Row k="Género" v={p.gender ?? "—"} />
            <Row k="Ocupación" v={p.occupation ?? "—"} />
            <Row k="Código de referido" v={p.referral_code} />
            <Row
              k="Referido por"
              v={
                parent ? (
                  <Link href={`/admin/participants/${parent.id}`} className="text-brand-deep underline">
                    {parent.full_name}
                  </Link>
                ) : (
                  "—"
                )
              }
            />
            <Row k="Estado" v={p.status} />
            <Row k="Fuente" v={p.source ?? "público (formulario web)"} />
            <Row k="Versión política" v={p.privacy_version} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consentimientos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ConsentRow ok={p.consent_personal_data} label="Datos personales (obligatorio)" />
            <ConsentRow
              ok={p.consent_sensitive_political_data}
              label="Datos políticos sensibles"
            />
            <ConsentRow ok={p.consent_whatsapp} label="Contacto por WhatsApp" />
            <Row k="Versión política" v={p.privacy_version} />
            <Row k="IP hash" v={<code className="text-xs">{p.ip_hash ?? "—"}</code>} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Respuestas al sondeo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(responses ?? []).length === 0 ? (
            <p className="text-sm text-brand-muted">Aún no respondió el sondeo.</p>
          ) : (
            <>
              {responses!.map((r) => (
                <div
                  key={r.id}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      Respuesta {r.completed ? "completa" : "parcial"} ·{" "}
                      <span className="text-brand-muted">
                        {formatDate(r.created_at)}
                      </span>
                    </p>
                    <Badge variant={r.completed ? "success" : "muted"}>
                      {r.completed ? "OK" : "Parcial"}
                    </Badge>
                  </div>
                </div>
              ))}
              {sortedAnswers.length > 0 ? (
                <ol className="space-y-2 text-sm">
                  {sortedAnswers.map((a, idx) => (
                    <li
                      key={`${a.response_id}-${idx}`}
                      className="rounded-md border border-slate-200 px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-mono uppercase tracking-wider text-brand-muted">
                            P{a.survey_questions?.display_order ?? "?"}
                            {a.survey_questions?.is_sensitive ? " · Sensible" : ""}
                          </p>
                          <p className="mt-0.5 text-sm font-medium text-brand-text">
                            {a.survey_questions?.question_text ?? "—"}
                          </p>
                          <p className="mt-1 text-sm text-brand-deep">
                            →{" "}
                            <strong>
                              {a.survey_options?.option_text ?? a.answer_text ?? "—"}
                            </strong>
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Eventos de share ({shareEvents?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(shareEvents ?? []).length === 0 ? (
              <p className="text-sm text-brand-muted">
                No ha compartido el enlace por ningún canal.
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {shareEvents!.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-1.5"
                  >
                    <span>
                      <Badge variant="outline">{s.channel}</Badge>
                      <span className="ml-2 font-mono text-xs">
                        {s.referral_code}
                      </span>
                    </span>
                    <span className="text-xs text-brand-muted">
                      {formatDate(s.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Trazabilidad ({auditEvents?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(auditEvents ?? []).length === 0 ? (
              <p className="text-sm text-brand-muted">
                No hay eventos de auditoría asociados a este participante.
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {auditEvents!.map((e) => {
                  const actor = (e as unknown as { profiles: { email: string } | null }).profiles;
                  return (
                    <li
                      key={e.id}
                      className="rounded-md border border-slate-200 px-3 py-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs">{e.action}</span>
                        <span className="text-xs text-brand-muted">
                          {formatDate(e.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-brand-muted">
                        {actor?.email ?? "—"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Referidos directos ({refs?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {(refs ?? []).length === 0 ? (
            <p className="text-sm text-brand-muted">No ha referido a nadie aún.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {refs!.map((r) => {
                const child = (r as unknown as { participants: { full_name: string; department: string } | null }).participants;
                return (
                  <li
                    key={r.child_participant_id}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2"
                  >
                    <div>
                      <Link
                        href={`/admin/participants/${r.child_participant_id}`}
                        className="font-medium text-brand-deep hover:underline"
                      >
                        {child?.full_name ?? "—"}
                      </Link>
                      <p className="text-xs text-brand-muted">{child?.department}</p>
                    </div>
                    <span className="text-xs text-brand-muted">{formatDate(r.created_at)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Acciones</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <form action={async () => {
            "use server";
            await markDoNotContactAction(p.id);
          }}>
            <Button type="submit" variant="outline">Marcar como no contactar</Button>
          </form>
          {admin.role === "super_admin" ? (
            <>
              <form action={async () => {
                "use server";
                await anonymizeParticipantAction(p.id);
              }}>
                <Button type="submit" variant="outline">Anonimizar</Button>
              </form>
              <form action={async () => {
                "use server";
                await deleteParticipantAction(p.id);
              }}>
                <Button type="submit" variant="destructive">Eliminar definitivamente</Button>
              </form>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-brand-muted">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}

function ConsentRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <Badge variant={ok ? "success" : "muted"}>{ok ? "Sí" : "No"}</Badge>
    </div>
  );
}

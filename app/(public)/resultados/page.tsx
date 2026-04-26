import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ResultsDashboard,
  type PublicResultRow,
  type DepartmentRow,
  type DayRow,
} from "@/components/public/results-dashboard";
import {
  ResultsHeadline,
  type CandidateResultRow,
} from "@/components/public/results-headline";
import {
  ExternalPollsList,
  type ExternalPollWithResults,
} from "@/components/public/external-polls-list";
import { TRANSPARENCY_DISCLAIMER } from "@/lib/constants";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Resultados agregados",
  description:
    "Resultados públicos del sondeo ciudadano. Datos agregados por candidato, tema, departamento y nivel de decisión.",
};

const NO_LOCATION_KEYS = new Set([
  "Sin departamento informado",
  "Sin región informada",
]);

export default async function ResultadosPage() {
  const supabase = await createSupabaseServerClient();

  const [byQuestionRes, summaryRes, byDayRes, byDeptRes, polls] =
    await Promise.all([
      supabase.from("v_public_results").select("*"),
      supabase.from("v_public_summary").select("*").maybeSingle(),
      supabase.from("v_participation_by_day").select("*"),
      supabase
        .from("v_participation_by_department")
        .select("department, total"),
      supabase
        .from("external_polls")
        .select(
          "id, title, pollster, publication_date, source_url, technical_sheet, notes, image_url, external_poll_results(candidate_name, percentage)",
        )
        .eq("visible", true)
        .order("publication_date", { ascending: false }),
    ]);

  const byQuestion: PublicResultRow[] =
    (byQuestionRes.data ?? []) as PublicResultRow[];
  const byDay: DayRow[] = (byDayRes.data ?? []).map((d) => ({
    day: typeof d.day === "string" ? d.day.slice(5) : "",
    total: Number(d.total),
  }));
  const summary = summaryRes.data ?? {
    total_participants: 0,
    total_responses_completed: 0,
    total_responses_partial: 0,
    total_departments: 0,
    total_municipalities: 0,
  };

  // Por departamento — para mapa: excluir "Sin departamento informado".
  const allDept = (byDeptRes.data ?? []).map((d) => ({
    department: d.department ?? "",
    total: Number(d.total ?? 0),
  }));
  const byDepartmentForMap: DepartmentRow[] = allDept
    .filter((d) => !NO_LOCATION_KEYS.has(d.department))
    .sort((a, b) => b.total - a.total);
  // Para el dashboard mostramos todos (incluyendo "Sin…")
  const byDepartment: DepartmentRow[] = [...allDept].sort(
    (a, b) => b.total - a.total,
  );

  // Pregunta principal: la que tiene candidatos enlazados.
  const candidateRows = byQuestion.filter(
    (r) => r.candidate_id !== null && r.option_id !== null,
  );
  const candidates: CandidateResultRow[] = candidateRows.map((r) => ({
    option_id: r.option_id ?? "",
    option_text: r.option_text ?? "",
    total: Number(r.total ?? 0),
    candidate_id: r.candidate_id,
  }));

  const externalPolls: ExternalPollWithResults[] = (polls.data ?? []).map(
    (p) => ({
      id: p.id as string,
      title: p.title as string,
      pollster: p.pollster as string,
      publication_date: p.publication_date as string,
      source_url: p.source_url as string,
      technical_sheet: (p.technical_sheet as string | null) ?? null,
      notes: (p.notes as string | null) ?? null,
      image_url: (p.image_url as string | null) ?? null,
      results:
        (p as unknown as {
          external_poll_results: Array<{
            candidate_name: string;
            percentage: number;
          }>;
        }).external_poll_results ?? [],
    }),
  );

  const totalParticipants = Number(summary.total_participants ?? 0);

  return (
    <div className="container-page py-12">
      <header className="max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-widest text-brand-accent">
          Resultados públicos
        </p>
        <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-brand-deep md:text-4xl">
          Resultados agregados del sondeo
        </h1>
        <p className="mt-3 text-sm text-brand-muted">{TRANSPARENCY_DISCLAIMER}</p>
      </header>

      <div className="mt-10">
        <ResultsHeadline
          byDepartment={byDepartmentForMap}
          candidates={candidates}
          totalParticipants={totalParticipants}
        />
      </div>

      <div className="mt-12">
        <p className="font-mono text-[11px] uppercase tracking-widest text-brand-deep">
          Detalle por pregunta
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-deep">
          Todas las respuestas, agregadas
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-brand-muted">
          Resumen de cada pregunta del sondeo, ranking territorial y evolución
          temporal de la participación.
        </p>
        <div className="mt-6">
          <ResultsDashboard
            byQuestion={byQuestion}
            byDepartment={byDepartment}
            byDay={byDay}
            summary={{
              total_participants: totalParticipants,
              total_responses_completed: Number(
                summary.total_responses_completed ?? 0,
              ),
              total_departments: Number(summary.total_departments ?? 0),
              total_municipalities: Number(summary.total_municipalities ?? 0),
            }}
          />
        </div>
      </div>

      <section className="mt-16">
        <header className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-widest text-brand-deep">
            Fuentes externas
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-deep">
            Encuestas y mediciones externas
          </h2>
          <p className="mt-2 text-sm text-brand-muted">
            Agregamos referencias a encuestas publicadas por terceros. Estas
            mediciones provienen de fuentes externas; ingresa al enlace para ver
            la ficha técnica completa.
          </p>
        </header>
        <div className="mt-6">
          <ExternalPollsList polls={externalPolls} />
        </div>
      </section>
    </div>
  );
}

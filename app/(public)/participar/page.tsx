import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SondeoWizard, type SurveyQuestion } from "@/components/public/sondeo-wizard";

export const metadata: Metadata = {
  title: "Participar",
  description:
    "Responde el sondeo ciudadano presidencial 2026. Toma menos de 2 minutos.",
};

interface PageProps {
  searchParams: Promise<{ ref?: string }>;
}

export default async function ParticiparPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const refCode = sp.ref ? sp.ref.toUpperCase().slice(0, 16) : null;

  const supabase = createSupabaseAdminClient();
  const [{ data: questions }, { data: options }] = await Promise.all([
    supabase
      .from("survey_questions")
      .select("id, question_text, question_type, is_sensitive, required, display_order")
      .eq("active", true)
      .order("display_order", { ascending: true }),
    supabase
      .from("survey_options")
      .select("id, question_id, option_text, option_value, candidate_id, display_order")
      .eq("active", true)
      .order("display_order", { ascending: true }),
  ]);

  const grouped: SurveyQuestion[] = (questions ?? []).map((q) => ({
    id: q.id,
    question_text: q.question_text,
    question_type: q.question_type,
    is_sensitive: q.is_sensitive,
    required: q.required,
    options: (options ?? [])
      .filter((o) => o.question_id === q.id)
      .map((o) => ({
        id: o.id,
        option_text: o.option_text,
        option_value: o.option_value,
        candidate_id: o.candidate_id,
      })),
  }));

  if (grouped.length === 0) {
    return (
      <div className="container-narrow py-16 text-center">
        <h1 className="text-2xl font-semibold">Sondeo no disponible</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Aún no hay preguntas activas. Vuelve más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="container-narrow py-10 md:py-14">
      <SondeoWizard questions={grouped} refCode={refCode} />
    </div>
  );
}

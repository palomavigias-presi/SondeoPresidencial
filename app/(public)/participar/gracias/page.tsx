import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ShareWhatsAppCard } from "@/components/public/share-whatsapp-card";
import { AiAdvisorMock } from "@/components/public/ai-advisor-mock";
import { Button } from "@/components/ui/button";
import { getAdvisor } from "@/lib/ai/advisor";

interface PageProps {
  searchParams: Promise<{ pid?: string }>;
}

export default async function GraciasPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const pid = sp.pid;
  if (!pid) notFound();

  const supabase = createSupabaseAdminClient();
  const { data: participant } = await supabase
    .from("participants")
    .select("id, full_name, referral_code, consent_whatsapp, consent_sensitive_political_data")
    .eq("id", pid)
    .maybeSingle();
  if (!participant) notFound();

  const { data: latestResponse } = await supabase
    .from("survey_responses")
    .select("id, profile_summary")
    .eq("participant_id", pid)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const answersForAi: Array<{ question_text: string; option_text: string | null }> = [];
  if (latestResponse) {
    const { data: ans } = await supabase
      .from("survey_answers")
      .select("survey_questions(question_text), survey_options(option_text)")
      .eq("response_id", latestResponse.id);
    for (const row of ans ?? []) {
      const r = row as unknown as {
        survey_questions: { question_text: string } | null;
        survey_options: { option_text: string } | null;
      };
      answersForAi.push({
        question_text: r.survey_questions?.question_text ?? "",
        option_text: r.survey_options?.option_text ?? null,
      });
    }
  }

  const advisor = getAdvisor();
  const advisorResult = await advisor.suggestAffinity({ answers: answersForAi });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

  return (
    <div className="container-narrow py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wider text-brand-accent">
          Gracias por participar
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-brand-deep">
          {participant.full_name.split(" ")[0]}, tus respuestas fueron registradas.
        </h1>
        <p className="mt-3 text-sm text-brand-muted">
          Tus respuestas se almacenan de forma segura. Los resultados públicos se
          muestran únicamente de forma agregada.{" "}
          {!participant.consent_sensitive_political_data ? (
            <>Como no autorizaste el tratamiento de opinión política como dato sensible, tus respuestas a preguntas marcadas como sensibles no se asociaron a tu contacto.</>
          ) : null}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/resultados">Ver resultados agregados</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="#share">Compartir mi enlace</Link>
          </Button>
        </div>
      </div>

      <div id="share" className="mt-8 space-y-8">
        <ShareWhatsAppCard
          participantId={participant.id}
          referralCode={participant.referral_code}
          siteUrl={siteUrl}
          consentWhatsApp={participant.consent_whatsapp}
        />
        <AiAdvisorMock result={advisorResult} />
      </div>

      <div className="mt-10 rounded-md border border-slate-200 bg-slate-50 p-4 text-xs text-brand-muted">
        ¿Quieres rectificar o eliminar tus datos? Visita{" "}
        <Link href="/eliminar-mis-datos" className="text-brand-deep underline">
          /eliminar-mis-datos
        </Link>
        .
      </div>
    </div>
  );
}

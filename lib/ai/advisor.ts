/**
 * AI Advisor — capa de servicio desacoplada.
 *
 * En MVP opera en modo "mock": devuelve respuestas determinísticas a partir de
 * las propuestas guardadas en la tabla `candidate_proposals` y de las respuestas
 * del usuario, sin llamar a ningún LLM.
 *
 * Para conectar un proveedor real (OpenAI/Anthropic/Gemini), implementa un
 * cliente que cumpla la interfaz `AiProvider` y selecciónalo según AI_PROVIDER.
 *
 * REGLAS DE TRANSPARENCIA (no opcionales, ver project_pulso_colombia.md):
 *   - Nunca usar lenguaje directivo ("debes votar por X").
 *   - Citar fuente cuando se extraiga información de candidate_proposals.
 *   - Mostrar más de un candidato cuando el tema aplique.
 *   - Si no hay fuentes suficientes: "No tengo información verificada suficiente sobre este punto."
 */

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface CandidateProposalRef {
  candidate_id: string;
  candidate_name: string;
  topic: string;
  proposal: string;
  source_url: string | null;
  source_name: string | null;
}

export interface AffinityResult {
  topPriorities: string[];
  matches: Array<{
    candidate_id: string;
    candidate_name: string;
    matchedTopics: string[];
    proposals: CandidateProposalRef[];
    rationale: string;
  }>;
  disclaimer: string;
}

export interface AiProvider {
  suggestAffinity(input: {
    answers: Array<{ question_text: string; option_text: string | null; topic?: string | null }>;
  }): Promise<AffinityResult>;
  compareCandidates(input: {
    topic: string;
    candidateIds: string[];
  }): Promise<{ topic: string; rows: CandidateProposalRef[]; disclaimer: string }>;
  explainCandidate(input: {
    candidateId: string;
    topic?: string;
  }): Promise<{ proposals: CandidateProposalRef[]; disclaimer: string }>;
}

const DISCLAIMER =
  "Esta comparación se construye a partir de las propuestas y fuentes verificadas que el equipo del sondeo ha cargado. No es una recomendación de voto. Revisa siempre las fuentes citadas y otras opiniones antes de decidir.";

class MockAdvisor implements AiProvider {
  async suggestAffinity(input: {
    answers: Array<{ question_text: string; option_text: string | null; topic?: string | null }>;
  }): Promise<AffinityResult> {
    const supabase = createSupabaseAdminClient();
    const topPriorities = extractTopics(input.answers);

    if (topPriorities.length === 0) {
      return {
        topPriorities,
        matches: [],
        disclaimer:
          "No tengo información verificada suficiente sobre tus prioridades para sugerir afinidad. Puedes revisar las propuestas de cada candidato directamente.",
      };
    }

    const { data: proposals } = await supabase
      .from("candidate_proposals")
      .select("candidate_id, topic, proposal, source_url, source_name, candidates(name, active)")
      .in("topic", topPriorities);

    const grouped = new Map<string, CandidateProposalRef[]>();
    for (const row of proposals ?? []) {
      const cand = (row as unknown as { candidates: { name: string; active: boolean } | null }).candidates;
      if (!cand?.active) continue;
      const ref: CandidateProposalRef = {
        candidate_id: row.candidate_id as string,
        candidate_name: cand.name,
        topic: row.topic as string,
        proposal: row.proposal as string,
        source_url: row.source_url as string | null,
        source_name: row.source_name as string | null,
      };
      const list = grouped.get(ref.candidate_id) ?? [];
      list.push(ref);
      grouped.set(ref.candidate_id, list);
    }

    const matches = Array.from(grouped.entries()).map(([candidate_id, refs]) => {
      const matchedTopics = Array.from(new Set(refs.map((r) => r.topic)));
      const candidate_name = refs[0]?.candidate_name ?? "";
      return {
        candidate_id,
        candidate_name,
        matchedTopics,
        proposals: refs,
        rationale: `Marcaste como prioridades: ${topPriorities.join(", ")}. Esta candidatura tiene propuestas registradas sobre: ${matchedTopics.join(", ")}.`,
      };
    });

    matches.sort((a, b) => b.matchedTopics.length - a.matchedTopics.length);

    return { topPriorities, matches, disclaimer: DISCLAIMER };
  }

  async compareCandidates(input: { topic: string; candidateIds: string[] }) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("candidate_proposals")
      .select("candidate_id, topic, proposal, source_url, source_name, candidates(name, active)")
      .eq("topic", input.topic)
      .in("candidate_id", input.candidateIds);

    const rows: CandidateProposalRef[] = (data ?? [])
      .map((row) => {
        const cand = (row as unknown as { candidates: { name: string; active: boolean } | null }).candidates;
        return {
          candidate_id: row.candidate_id as string,
          candidate_name: cand?.name ?? "",
          topic: row.topic as string,
          proposal: row.proposal as string,
          source_url: row.source_url as string | null,
          source_name: row.source_name as string | null,
        };
      })
      .filter((r) => r.candidate_name);

    return {
      topic: input.topic,
      rows,
      disclaimer:
        rows.length === 0
          ? "No tengo información verificada suficiente sobre este tema para comparar a los candidatos seleccionados."
          : DISCLAIMER,
    };
  }

  async explainCandidate(input: { candidateId: string; topic?: string }) {
    const supabase = createSupabaseAdminClient();
    let q = supabase
      .from("candidate_proposals")
      .select("candidate_id, topic, proposal, source_url, source_name, candidates(name, active)")
      .eq("candidate_id", input.candidateId);
    if (input.topic) q = q.eq("topic", input.topic);
    const { data } = await q;

    const proposals: CandidateProposalRef[] = (data ?? []).map((row) => {
      const cand = (row as unknown as { candidates: { name: string; active: boolean } | null }).candidates;
      return {
        candidate_id: row.candidate_id as string,
        candidate_name: cand?.name ?? "",
        topic: row.topic as string,
        proposal: row.proposal as string,
        source_url: row.source_url as string | null,
        source_name: row.source_name as string | null,
      };
    });

    return {
      proposals,
      disclaimer:
        proposals.length === 0
          ? "No tengo información verificada suficiente sobre este candidato en el tema solicitado."
          : DISCLAIMER,
    };
  }
}

function extractTopics(
  answers: Array<{ question_text: string; option_text: string | null; topic?: string | null }>,
): string[] {
  const topics = new Set<string>();
  for (const a of answers) {
    if (a.topic) topics.add(a.topic);
    if (!a.option_text) continue;
    const txt = a.option_text.toLowerCase();
    if (txt.includes("seguridad")) topics.add("Seguridad");
    if (txt.includes("economía") || txt.includes("empleo") || txt.includes("estabilidad económica"))
      topics.add("Economía");
    if (txt.includes("corrupción")) topics.add("Corrupción");
    if (txt.includes("salud")) topics.add("Salud");
    if (txt.includes("educación")) topics.add("Educación");
    if (txt.includes("costo de vida")) topics.add("Costo de vida");
    if (txt.includes("paz") || txt.includes("orden público")) topics.add("Paz");
    if (txt.includes("medio ambiente")) topics.add("Medio ambiente");
    if (txt.includes("autoridad")) topics.add("Seguridad");
    if (txt.includes("libertades")) topics.add("Libertades");
    if (txt.includes("justicia social")) topics.add("Justicia social");
  }
  return Array.from(topics);
}

let _provider: AiProvider | null = null;
export function getAdvisor(): AiProvider {
  if (_provider) return _provider;
  // Hook futuro: leer process.env.AI_PROVIDER y construir cliente real.
  _provider = new MockAdvisor();
  return _provider;
}

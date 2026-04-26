"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { participantSchema } from "@/lib/validators/participant";
import { surveyAnswerSchema } from "@/lib/validators/survey";
import { generateReferralCode, hashIp } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { PRIVACY_VERSION } from "@/lib/constants";
import { DEPARTMENT_REGION } from "@/lib/colombia-geo";
import type { Json } from "@/lib/types/database";
import { z } from "zod";

const submissionSchema = z.object({
  participant: z.unknown(),
  answers: z.array(surveyAnswerSchema).default([]),
});

export interface SubmitState {
  ok: boolean;
  redirectTo?: string;
  errors?: Record<string, string[]>;
  formError?: string;
}

interface RawAnswer {
  question_id: string;
  option_id?: string | null;
  answer_text?: string | null;
}

interface SubmitInput {
  participant: Record<string, unknown>;
  answers: RawAnswer[];
}

/**
 * Acción única que crea participante + respuesta + answers de manera atómica.
 * Si falla en algún paso, se hace rollback (borrando lo creado).
 */
export async function submitSurveyAndRegisterAction(
  input: SubmitInput,
): Promise<SubmitState> {
  const parsedInput = submissionSchema.safeParse(input);
  if (!parsedInput.success) {
    return { ok: false, formError: "Datos inválidos." };
  }

  const parsedParticipant = participantSchema.safeParse(input.participant);
  if (!parsedParticipant.success) {
    return {
      ok: false,
      errors: parsedParticipant.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const data = parsedParticipant.data;
  const answers = parsedInput.data.answers as RawAnswer[];

  // Rate limit por IP + teléfono
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "0.0.0.0";
  const rl = rateLimit(`register:${ip}:${data.whatsapp}`, { windowSeconds: 60, max: 3 });
  if (!rl.allowed) {
    return { ok: false, formError: "Has hecho muchos intentos. Espera unos segundos e intenta de nuevo." };
  }

  let supabase;
  try {
    supabase = createSupabaseAdminClient();
  } catch (e) {
    return {
      ok: false,
      formError:
        "Configuración del servidor incompleta. Avisa al administrador (falta SUPABASE_SERVICE_ROLE_KEY).",
    };
  }

  // Si dieron departamento pero no región, inferimos
  let region = data.region;
  if (!region && data.department) {
    region = DEPARTMENT_REGION[data.department] ?? null;
  }

  // Resolver código de referido → padre
  let referredBy: string | null = null;
  if (data.referral_code) {
    const { data: parent } = await supabase
      .from("participants")
      .select("id")
      .eq("referral_code", data.referral_code)
      .maybeSingle();
    if (parent) referredBy = parent.id;
  }

  // Verificar duplicado por WhatsApp
  const { data: existing } = await supabase
    .from("participants")
    .select("id, referral_code")
    .eq("whatsapp", data.whatsapp)
    .maybeSingle();

  const ipHash = await hashIp(ip, process.env.IP_HASH_SALT ?? "salt");
  const userAgent = h.get("user-agent")?.slice(0, 500) ?? null;

  let participantId: string;
  let isNewParticipant = false;

  if (existing) {
    participantId = existing.id;
    const { error } = await supabase
      .from("participants")
      .update({
        full_name: data.full_name,
        department: data.department ?? "",
        municipality: data.municipality ?? "",
        region: region ?? "",
        age_range: data.age_range,
        gender: data.gender,
        occupation: data.occupation,
        consent_personal_data: data.consent_personal_data,
        consent_sensitive_political_data: data.consent_sensitive_political_data,
        consent_whatsapp: data.consent_whatsapp,
        privacy_version: PRIVACY_VERSION,
        ip_hash: ipHash,
        user_agent: userAgent,
      })
      .eq("id", existing.id);
    if (error) {
      return { ok: false, formError: "No pudimos actualizar tus datos. Intenta de nuevo." };
    }
  } else {
    const referralCode = await uniqueReferralCode(supabase);
    const { data: inserted, error } = await supabase
      .from("participants")
      .insert({
        full_name: data.full_name,
        whatsapp: data.whatsapp,
        department: data.department ?? "",
        municipality: data.municipality ?? "",
        region: region ?? "",
        age_range: data.age_range,
        gender: data.gender,
        occupation: data.occupation,
        referral_code: referralCode,
        referred_by: referredBy,
        consent_personal_data: data.consent_personal_data,
        consent_sensitive_political_data: data.consent_sensitive_political_data,
        consent_whatsapp: data.consent_whatsapp,
        privacy_version: PRIVACY_VERSION,
        ip_hash: ipHash,
        user_agent: userAgent,
        status: "registered",
      })
      .select("id")
      .single();

    if (error || !inserted) {
      return { ok: false, formError: "No pudimos registrar tus datos. Intenta de nuevo." };
    }
    participantId = inserted.id;
    isNewParticipant = true;

    if (referredBy) {
      await supabase.from("referral_events").insert({
        parent_participant_id: referredBy,
        child_participant_id: participantId,
      });
    }
  }

  // Si hay respuestas, persistirlas respetando consentimientos sensibles.
  if (answers.length > 0) {
    const { data: sensitiveQuestions } = await supabase
      .from("survey_questions")
      .select("id, is_sensitive");

    const sensitiveSet = new Set(
      (sensitiveQuestions ?? []).filter((q) => q.is_sensitive).map((q) => q.id),
    );
    const filtered = data.consent_sensitive_political_data
      ? answers
      : answers.filter((a) => !sensitiveSet.has(a.question_id));

    const { data: response, error: respErr } = await supabase
      .from("survey_responses")
      .insert({
        participant_id: participantId,
        completed: false,
      })
      .select("id")
      .single();

    if (respErr || !response) {
      return await rollbackOnFailure(
        supabase,
        isNewParticipant ? participantId : null,
        "Error guardando respuesta.",
      );
    }

    if (filtered.length > 0) {
      const { error: ansErr } = await supabase.from("survey_answers").insert(
        filtered.map((a) => ({
          response_id: response.id,
          question_id: a.question_id,
          option_id: a.option_id ?? null,
          answer_text: a.answer_text ?? null,
        })),
      );
      if (ansErr) {
        return await rollbackOnFailure(
          supabase,
          isNewParticipant ? participantId : null,
          "Error guardando las respuestas.",
        );
      }
    }

    const profileSummary = await buildProfileSummary(supabase, filtered);
    await supabase
      .from("survey_responses")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        profile_summary: profileSummary as Json,
      })
      .eq("id", response.id);

    await supabase
      .from("participants")
      .update({ status: "responded" })
      .eq("id", participantId);
  }

  redirect(`/participar/gracias?pid=${participantId}`);
}

async function rollbackOnFailure(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  participantIdToDelete: string | null,
  message: string,
): Promise<SubmitState> {
  if (participantIdToDelete) {
    await supabase.from("participants").delete().eq("id", participantIdToDelete);
  }
  return { ok: false, formError: message };
}

async function uniqueReferralCode(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = generateReferralCode(7);
    const { data } = await supabase
      .from("participants")
      .select("id")
      .eq("referral_code", code)
      .maybeSingle();
    if (!data) return code;
  }
  return generateReferralCode(10);
}

async function buildProfileSummary(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  answers: RawAnswer[],
): Promise<Record<string, unknown>> {
  const optionIds = answers.map((a) => a.option_id).filter(Boolean) as string[];
  if (optionIds.length === 0) return {};
  const { data: options } = await supabase
    .from("survey_options")
    .select("id, option_value, option_text, question_id")
    .in("id", optionIds);

  const byOption = new Map(options?.map((o) => [o.id, o]) ?? []);
  const summary: Record<string, unknown> = {};

  for (const a of answers) {
    if (!a.option_id) continue;
    const opt = byOption.get(a.option_id);
    if (!opt) continue;
    summary[`q:${opt.question_id}`] = {
      value: opt.option_value,
      text: opt.option_text,
    };
  }
  return summary;
}

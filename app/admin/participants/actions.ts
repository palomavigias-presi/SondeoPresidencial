"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import type { Json } from "@/lib/types/database";

async function logAudit(
  actorId: string,
  action: string,
  entity: string,
  entityId: string | null,
  metadata?: Record<string, unknown>,
) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity,
    entity_id: entityId,
    metadata: (metadata ?? null) as Json,
  });
}

export async function markDoNotContactAction(participantId: string) {
  const admin = await requireAdmin("campaign_manager");
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("participants")
    .update({ status: "do_not_contact", consent_whatsapp: false })
    .eq("id", participantId);
  await logAudit(admin.userId, "mark_do_not_contact", "participants", participantId);
  revalidatePath("/admin/participants");
  revalidatePath(`/admin/participants/${participantId}`);
}

export async function anonymizeParticipantAction(participantId: string) {
  const admin = await requireAdmin("super_admin");
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("participants")
    .update({
      full_name: "Anónimo",
      whatsapp: `anon_${participantId.slice(0, 8)}`,
      occupation: null,
      gender: null,
      age_range: null,
      consent_whatsapp: false,
      status: "anonymized",
    })
    .eq("id", participantId);
  await logAudit(admin.userId, "anonymize", "participants", participantId);
  revalidatePath("/admin/participants");
  revalidatePath(`/admin/participants/${participantId}`);
}

export async function deleteParticipantAction(participantId: string) {
  const admin = await requireAdmin("super_admin");
  const supabase = createSupabaseAdminClient();
  await supabase.from("participants").delete().eq("id", participantId);
  await logAudit(admin.userId, "delete", "participants", participantId);
  revalidatePath("/admin/participants");
}

interface ExportFilters {
  department?: string;
  region?: string;
  consentWhatsApp?: boolean;
  source?: "real" | "simulated" | "all";
}

export async function exportParticipantsCsvAction(
  filters: ExportFilters,
): Promise<{ csv: string; filename: string }> {
  const admin = await requireAdmin("super_admin");
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("participants")
    .select(
      "full_name, whatsapp, department, municipality, region, age_range, gender, occupation, referral_code, status, source, consent_whatsapp, created_at",
    )
    .order("created_at", { ascending: false });
  if (filters.department) query = query.eq("department", filters.department);
  if (filters.region) query = query.eq("region", filters.region);
  if (filters.consentWhatsApp !== undefined)
    query = query.eq("consent_whatsapp", filters.consentWhatsApp);
  const sourceFilter = filters.source ?? "real";
  if (sourceFilter === "simulated") query = query.eq("source", "simulated");
  else if (sourceFilter === "real")
    query = query.or("source.is.null,source.neq.simulated");

  const { data } = await query;
  const header =
    "full_name,whatsapp,source,department,municipality,region,age_range,gender,occupation,referral_code,status,consent_whatsapp,created_at\n";
  const body = (data ?? [])
    .map((r) =>
      [
        csv(r.full_name),
        csv(r.whatsapp),
        csv(r.source ?? "real"),
        csv(r.department),
        csv(r.municipality),
        csv(r.region),
        csv(r.age_range),
        csv(r.gender),
        csv(r.occupation),
        csv(r.referral_code),
        csv(r.status),
        r.consent_whatsapp ? "true" : "false",
        r.created_at,
      ].join(","),
    )
    .join("\n");

  await logAudit(admin.userId, "export_participants_csv", "participants", null, {
    filters,
    rows: data?.length ?? 0,
  });

  return {
    csv: header + body + "\n",
    filename: `participantes-${sourceFilter}-${new Date().toISOString().slice(0, 10)}.csv`,
  };
}

function csv(v: string | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

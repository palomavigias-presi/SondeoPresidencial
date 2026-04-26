"use server";

import { revalidatePath } from "next/cache";
import { parse as parseCsv } from "csv-parse/sync";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { campaignSchema, messageTemplateSchema } from "@/lib/validators/survey";
import { normalizeWhatsApp } from "@/lib/utils";

export async function createCampaignAction(formData: FormData) {
  const admin = await requireAdmin("campaign_manager");
  const parsed = campaignSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || null,
    channel: formData.get("channel") || "whatsapp",
    status: formData.get("status") || "draft",
  });
  if (!parsed.success) return;
  const supabase = createSupabaseAdminClient();
  await supabase.from("campaigns").insert({ ...parsed.data, created_by: admin.userId });
  revalidatePath("/admin/campaigns");
}

export async function updateCampaignStatusAction(campaignId: string, status: string) {
  await requireAdmin("campaign_manager");
  const supabase = createSupabaseAdminClient();
  await supabase.from("campaigns").update({ status }).eq("id", campaignId);
  revalidatePath(`/admin/campaigns/${campaignId}`);
  revalidatePath("/admin/campaigns");
}

export async function upsertTemplateAction(formData: FormData) {
  await requireAdmin("campaign_manager");
  const supabase = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");
  const parsed = messageTemplateSchema.safeParse({
    campaign_id: formData.get("campaign_id"),
    name: formData.get("name"),
    body: formData.get("body"),
    status: formData.get("status") || "draft",
  });
  if (!parsed.success) return;
  if (id) await supabase.from("message_templates").update(parsed.data).eq("id", id);
  else await supabase.from("message_templates").insert(parsed.data);
  revalidatePath(`/admin/campaigns/${parsed.data.campaign_id}`);
}

export interface ImportSummary {
  total: number;
  valid: number;
  duplicates: number;
  invalid: number;
  noOptIn: number;
  errors: string[];
}

export async function importContactsCsvAction(
  campaignId: string,
  formData: FormData,
): Promise<ImportSummary> {
  await requireAdmin("campaign_manager");
  const file = formData.get("csv") as File | null;
  if (!file) return emptySummary();

  const text = await file.text();
  let records: Array<Record<string, string>> = [];
  try {
    records = parseCsv(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<Record<string, string>>;
  } catch (e) {
    return { ...emptySummary(), errors: [`No se pudo leer el CSV: ${(e as Error).message}`] };
  }

  const supabase = createSupabaseAdminClient();
  let valid = 0;
  let duplicates = 0;
  let invalid = 0;
  let noOptIn = 0;
  const errors: string[] = [];

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const fullName = (row.nombre ?? row.full_name ?? "").trim();
    const rawPhone = (row.whatsapp ?? row.telefono ?? "").trim();
    const optInRaw = (row.consentimiento_whatsapp ?? row.opt_in ?? "").toLowerCase().trim();
    const hasOptIn = ["true", "1", "si", "sí", "yes"].includes(optInRaw);

    const phone = normalizeWhatsApp(rawPhone);
    if (!fullName || !phone) {
      invalid += 1;
      errors.push(`Fila ${i + 2}: nombre o WhatsApp inválido.`);
      continue;
    }
    if (!hasOptIn) {
      noOptIn += 1;
      await supabase.from("campaign_contacts").upsert(
        {
          campaign_id: campaignId,
          full_name: fullName,
          whatsapp: phone,
          department: (row.departamento ?? "").trim() || null,
          municipality: (row.municipio ?? "").trim() || null,
          region: (row.region ?? row["región"] ?? "").trim() || null,
          has_opt_in: false,
          import_status: "rejected_no_opt_in",
          error_message: "Consentimiento WhatsApp = false",
        },
        { onConflict: "campaign_id,whatsapp" },
      );
      continue;
    }

    const { error } = await supabase.from("campaign_contacts").upsert(
      {
        campaign_id: campaignId,
        full_name: fullName,
        whatsapp: phone,
        department: (row.departamento ?? "").trim() || null,
        municipality: (row.municipio ?? "").trim() || null,
        region: (row.region ?? row["región"] ?? "").trim() || null,
        has_opt_in: true,
        import_status: "ready",
        error_message: null,
      },
      { onConflict: "campaign_id,whatsapp" },
    );
    if (error) {
      if (error.code === "23505") {
        duplicates += 1;
      } else {
        invalid += 1;
        errors.push(`Fila ${i + 2}: ${error.message}`);
      }
      continue;
    }
    valid += 1;
  }

  revalidatePath(`/admin/campaigns/${campaignId}`);
  return { total: records.length, valid, duplicates, invalid, noOptIn, errors: errors.slice(0, 50) };
}

function emptySummary(): ImportSummary {
  return { total: 0, valid: 0, duplicates: 0, invalid: 0, noOptIn: 0, errors: [] };
}

export async function exportCampaignContactsCsv(
  campaignId: string,
): Promise<{ csv: string; filename: string }> {
  await requireAdmin("campaign_manager");
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("campaign_contacts")
    .select("full_name, whatsapp, department, municipality, region")
    .eq("campaign_id", campaignId)
    .eq("has_opt_in", true);
  const header = "full_name,whatsapp,department,municipality,region\n";
  const body = (data ?? [])
    .map((r) =>
      [r.full_name, r.whatsapp, r.department ?? "", r.municipality ?? "", r.region ?? ""]
        .map((v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v))
        .join(","),
    )
    .join("\n");
  return {
    csv: header + body + "\n",
    filename: `campana-${campaignId}-contactos.csv`,
  };
}

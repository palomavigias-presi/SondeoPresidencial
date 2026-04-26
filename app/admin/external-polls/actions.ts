"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { externalPollSchema } from "@/lib/validators/survey";

export async function upsertExternalPollAction(formData: FormData) {
  await requireAdmin("campaign_manager");
  const id = String(formData.get("id") ?? "");
  const resultsRaw = String(formData.get("results_json") ?? "[]");
  let results: Array<{ candidate_name: string; percentage: number }> = [];
  try {
    results = JSON.parse(resultsRaw);
  } catch {
    results = [];
  }
  const parsed = externalPollSchema.safeParse({
    title: formData.get("title"),
    pollster: formData.get("pollster"),
    publication_date: formData.get("publication_date"),
    source_url: formData.get("source_url"),
    technical_sheet: formData.get("technical_sheet") || null,
    image_url: formData.get("image_url") || null,
    notes: formData.get("notes") || null,
    visible: formData.get("visible") === "on",
    results,
  });
  if (!parsed.success) return;

  const supabase = createSupabaseAdminClient();
  const { results: pollResults, ...pollData } = parsed.data;

  let pollId = id;
  if (id) {
    await supabase.from("external_polls").update(pollData).eq("id", id);
    await supabase.from("external_poll_results").delete().eq("poll_id", id);
  } else {
    const { data, error } = await supabase
      .from("external_polls")
      .insert(pollData)
      .select("id")
      .single();
    if (error || !data) return;
    pollId = data.id;
  }
  if (pollResults.length > 0) {
    await supabase.from("external_poll_results").insert(
      pollResults.map((r, i) => ({
        poll_id: pollId,
        candidate_name: r.candidate_name,
        percentage: r.percentage,
        display_order: i,
      })),
    );
  }
  revalidatePath("/admin/external-polls");
  revalidatePath("/resultados");
}

export async function deleteExternalPollAction(id: string) {
  await requireAdmin("campaign_manager");
  const supabase = createSupabaseAdminClient();
  await supabase.from("external_polls").delete().eq("id", id);
  revalidatePath("/admin/external-polls");
  revalidatePath("/resultados");
}

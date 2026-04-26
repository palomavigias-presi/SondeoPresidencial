"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { candidateSchema } from "@/lib/validators/survey";

interface State {
  ok: boolean;
  message?: string;
}

export async function upsertCandidateAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  await requireAdmin("campaign_manager");
  const id = String(formData.get("id") ?? "");
  const parsed = candidateSchema.safeParse({
    name: formData.get("name"),
    party: formData.get("party") || null,
    bio: formData.get("bio") || null,
    photo_url: formData.get("photo_url") || null,
    color: formData.get("color") || null,
    active: formData.get("active") === "on",
    display_order: Number(formData.get("display_order") ?? 0),
  });
  if (!parsed.success) {
    return { ok: false, message: "Datos inválidos." };
  }

  const supabase = createSupabaseAdminClient();
  const payload = parsed.data;
  if (id) {
    await supabase.from("candidates").update(payload).eq("id", id);
  } else {
    await supabase.from("candidates").insert(payload);
  }
  revalidatePath("/admin/candidates");
  return { ok: true };
}

export async function deleteCandidateAction(id: string) {
  await requireAdmin("super_admin");
  const supabase = createSupabaseAdminClient();
  await supabase.from("candidates").delete().eq("id", id);
  revalidatePath("/admin/candidates");
}

export async function upsertProposalAction(formData: FormData) {
  await requireAdmin("campaign_manager");
  const supabase = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");
  const payload = {
    candidate_id: String(formData.get("candidate_id")),
    topic: String(formData.get("topic")),
    proposal: String(formData.get("proposal")),
    source_url: String(formData.get("source_url") ?? "") || null,
    source_name: String(formData.get("source_name") ?? "") || null,
  };
  if (id) await supabase.from("candidate_proposals").update(payload).eq("id", id);
  else await supabase.from("candidate_proposals").insert(payload);
  revalidatePath(`/admin/candidates/${payload.candidate_id}`);
}

export async function deleteProposalAction(id: string, candidateId: string) {
  await requireAdmin("campaign_manager");
  const supabase = createSupabaseAdminClient();
  await supabase.from("candidate_proposals").delete().eq("id", id);
  revalidatePath(`/admin/candidates/${candidateId}`);
}

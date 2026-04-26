"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { questionSchema } from "@/lib/validators/survey";

export async function upsertQuestionAction(formData: FormData) {
  await requireAdmin("campaign_manager");
  const id = String(formData.get("id") ?? "");
  const parsed = questionSchema.safeParse({
    question_text: formData.get("question_text"),
    question_type: formData.get("question_type"),
    is_sensitive: formData.get("is_sensitive") === "on",
    required: formData.get("required") === "on",
    active: formData.get("active") === "on",
    display_order: Number(formData.get("display_order") ?? 0),
  });
  if (!parsed.success) return;
  const supabase = createSupabaseAdminClient();
  if (id) await supabase.from("survey_questions").update(parsed.data).eq("id", id);
  else await supabase.from("survey_questions").insert(parsed.data);
  revalidatePath("/admin/questions");
}

export async function deleteQuestionAction(id: string) {
  await requireAdmin("super_admin");
  const supabase = createSupabaseAdminClient();
  await supabase.from("survey_questions").delete().eq("id", id);
  revalidatePath("/admin/questions");
}

export async function upsertOptionAction(formData: FormData) {
  await requireAdmin("campaign_manager");
  const supabase = createSupabaseAdminClient();
  const id = String(formData.get("id") ?? "");
  const payload = {
    question_id: String(formData.get("question_id")),
    option_text: String(formData.get("option_text")),
    option_value: String(formData.get("option_value") || formData.get("option_text"))
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, ""),
    candidate_id: (formData.get("candidate_id") as string) || null,
    display_order: Number(formData.get("display_order") ?? 0),
    active: formData.get("active") === "on",
  };
  if (id) await supabase.from("survey_options").update(payload).eq("id", id);
  else await supabase.from("survey_options").insert(payload);
  revalidatePath("/admin/questions");
}

export async function deleteOptionAction(id: string) {
  await requireAdmin("campaign_manager");
  const supabase = createSupabaseAdminClient();
  await supabase.from("survey_options").delete().eq("id", id);
  revalidatePath("/admin/questions");
}

"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function publishPrivacyVersionAction(formData: FormData) {
  await requireAdmin("super_admin");
  const supabase = createSupabaseAdminClient();
  const version = String(formData.get("version") ?? "").trim();
  const content = String(formData.get("content_md") ?? "");
  if (!version || !content) return;
  await supabase
    .from("privacy_policy_versions")
    .upsert({ version, content_md: content, is_current: true }, { onConflict: "version" });
  revalidatePath("/admin/settings");
  revalidatePath("/privacidad");
}

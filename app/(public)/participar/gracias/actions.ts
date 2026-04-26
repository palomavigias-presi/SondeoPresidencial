"use server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function registerShareAction(
  participantId: string,
  channel: string,
  referralCode: string,
): Promise<{ ok: boolean }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc("rpc_register_share", {
    p_participant_id: participantId,
    p_channel: channel,
    p_referral_code: referralCode,
  });
  if (error) return { ok: false };
  return { ok: true };
}

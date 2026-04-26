"use server";

import { headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { whatsappSchema } from "@/lib/validators/participant";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  whatsapp: whatsappSchema,
  reason: z.string().trim().max(1000).optional(),
});

export interface DeletionState {
  ok: boolean;
  message?: string;
}

export async function requestDeletionAction(
  _prev: DeletionState,
  formData: FormData,
): Promise<DeletionState> {
  const parsed = schema.safeParse({
    whatsapp: formData.get("whatsapp"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Verifica el número de WhatsApp." };
  }
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0] ?? "0.0.0.0";
  const rl = rateLimit(`deletion:${ip}`, { windowSeconds: 60, max: 3 });
  if (!rl.allowed) {
    return { ok: false, message: "Demasiados intentos. Espera y reintenta." };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc("rpc_request_deletion", {
    p_whatsapp: parsed.data.whatsapp,
    p_request_type: "delete",
    p_notes: parsed.data.reason ?? undefined,
  });
  if (error) {
    return { ok: false, message: "No pudimos registrar la solicitud. Intenta más tarde." };
  }
  return {
    ok: true,
    message:
      "Solicitud recibida. Procesaremos tu petición en los plazos legales y te contactaremos al WhatsApp suministrado.",
  };
}

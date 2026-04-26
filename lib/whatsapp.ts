/**
 * Capa de servicio WhatsApp.
 * En MVP NO se envía a la WhatsApp Business Cloud API: solo se preparan plantillas
 * y se exporta a CSV. Cuando se integre Cloud API, implementar `sendTemplate`
 * usando WHATSAPP_PROVIDER_TOKEN, WHATSAPP_PHONE_NUMBER_ID, etc.
 *
 * Política: solo enviar a contactos con consent_whatsapp = true / has_opt_in = true.
 */

export interface WhatsAppRecipient {
  whatsapp: string;
  participant_id?: string | null;
  full_name?: string | null;
}

export interface WhatsAppSendResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
}

export async function sendTemplate(_input: {
  to: WhatsAppRecipient;
  templateBody: string;
  campaignId: string;
}): Promise<WhatsAppSendResult> {
  // TODO: integrar https://graph.facebook.com/v20.0/{phone-number-id}/messages
  return {
    ok: false,
    error:
      "WhatsApp Business Cloud API no está configurada. Exporta la lista a CSV y envía con tu proveedor autorizado.",
  };
}

export function exportRecipientsToCsv(rows: WhatsAppRecipient[]): string {
  const header = "full_name,whatsapp\n";
  const body = rows
    .map((r) => `"${(r.full_name ?? "").replace(/"/g, '""')}",${r.whatsapp}`)
    .join("\n");
  return header + body + "\n";
}

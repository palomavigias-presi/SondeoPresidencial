"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, Check } from "lucide-react";
import { buildShareUrl, buildWhatsAppShareLink } from "@/lib/utils";
import { WHATSAPP_SHARE_TEMPLATE } from "@/lib/constants";
import { registerShareAction } from "@/app/(public)/participar/gracias/actions";

interface ShareWhatsAppCardProps {
  participantId: string;
  referralCode: string;
  siteUrl: string;
  consentWhatsApp: boolean;
}

export function ShareWhatsAppCard({
  participantId,
  referralCode,
  siteUrl,
  consentWhatsApp,
}: ShareWhatsAppCardProps) {
  const link = buildShareUrl(siteUrl, referralCode);
  const message = WHATSAPP_SHARE_TEMPLATE(link);
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const onCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onShare = () => {
    startTransition(() => {
      registerShareAction(participantId, "whatsapp", referralCode).catch(() => {});
    });
    window.open(buildWhatsAppShareLink(message), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-brand-deep">
            Comparte y amplía la muestra
          </h3>
          <p className="mt-1 text-sm text-brand-muted">
            Recibes un enlace personal. Quienes ingresen por él quedan vinculados
            a ti como referidor en el panel administrativo. No verás sus
            respuestas individuales.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <label className="text-xs font-medium uppercase tracking-wider text-brand-muted">
          Tu enlace personal
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            readOnly
            value={link}
            className="flex-1 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-mono text-brand-text"
          />
          <Button variant="outline" onClick={onCopy} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </div>
      </div>

      <div className="mt-5">
        {consentWhatsApp ? (
          <Button
            onClick={onShare}
            size="lg"
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            Compartir por WhatsApp
          </Button>
        ) : (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            Para compartir por WhatsApp tu enlace, vuelve a tu registro y
            activa la autorización de contacto por WhatsApp.
          </div>
        )}
        <p className="mt-3 text-xs text-brand-muted">
          Mensaje sugerido: <em>{WHATSAPP_SHARE_TEMPLATE("[tu link]")}</em>
        </p>
      </div>
    </div>
  );
}

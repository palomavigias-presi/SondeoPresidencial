import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CsvImporter } from "@/components/admin/csv-importer";
import {
  updateCampaignStatusAction,
  upsertTemplateAction,
} from "../actions";
import { formatDate } from "@/lib/utils";

const STATUSES = ["draft", "ready", "sent", "paused", "finished"];

export default async function CampaignDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("campaign_manager");
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!campaign) notFound();

  const [{ data: contacts }, { data: templates }, { data: logs }] = await Promise.all([
    supabase
      .from("campaign_contacts")
      .select("id, full_name, whatsapp, has_opt_in, import_status, error_message")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("message_templates")
      .select("id, name, body, status, created_at")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("message_logs")
      .select("id, status, whatsapp, created_at")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/campaigns" className="text-sm text-brand-muted hover:underline">
          ← Volver
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-brand-deep">{campaign.name}</h1>
            <p className="text-sm text-brand-muted">
              Estado actual: <Badge variant="outline">{campaign.status}</Badge>{" "}
              · canal: {campaign.channel}
            </p>
          </div>
          <form
            action={async (fd) => {
              "use server";
              await updateCampaignStatusAction(id, String(fd.get("status")));
            }}
            className="flex items-center gap-2"
          >
            <select
              name="status"
              defaultValue={campaign.status}
              className="h-10 rounded-md border border-slate-300 bg-white px-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm">
              Cambiar estado
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Importar contactos (CSV)</CardTitle>
          <CardDescription>
            Solo se importarán contactos con consentimiento_whatsapp = true.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CsvImporter campaignId={id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Contactos cargados ({contacts?.length ?? 0})
          </CardTitle>
          <CardDescription>
            Mostrando últimos 200. Exporta para envío externo si todavía no has integrado WhatsApp Business API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex justify-end">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/campaigns/${id}/export`} prefetch={false}>
                Exportar CSV (solo opt-in)
              </Link>
            </Button>
          </div>
          <ul className="space-y-1 text-sm">
            {(contacts ?? []).map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-1.5"
              >
                <div>
                  <span className="font-medium">{c.full_name}</span>{" "}
                  <span className="text-xs text-brand-muted">{c.whatsapp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.has_opt_in ? "success" : "destructive"}>
                    {c.has_opt_in ? "Opt-in" : "Sin opt-in"}
                  </Badge>
                  <span className="text-xs text-brand-muted">{c.import_status}</span>
                </div>
              </li>
            ))}
            {(contacts ?? []).length === 0 ? (
              <p className="text-sm text-brand-muted">Aún no hay contactos en la campaña.</p>
            ) : null}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plantilla de mensaje</CardTitle>
          <CardDescription>
            Usa <code>{`{{nombre}}`}</code> y <code>{`{{link}}`}</code> en el cuerpo
            (interpolación se hará al integrar Cloud API).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={upsertTemplateAction} className="grid gap-2">
            <input type="hidden" name="campaign_id" value={id} />
            <div>
              <Label htmlFor="t-name">Nombre</Label>
              <Input id="t-name" name="name" required />
            </div>
            <div>
              <Label htmlFor="t-body">Cuerpo</Label>
              <Textarea id="t-body" name="body" rows={4} required />
            </div>
            <Button type="submit">Guardar plantilla</Button>
          </form>
          <ul className="space-y-2 text-sm">
            {(templates ?? []).map((t) => (
              <li key={t.id} className="rounded-md border border-slate-200 p-3">
                <p className="font-medium">{t.name}</p>
                <p className="mt-1 whitespace-pre-wrap text-brand-text">{t.body}</p>
                <p className="mt-1 text-xs text-brand-muted">
                  Estado: {t.status} · {formatDate(t.created_at)}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logs de envío (últimos 50)</CardTitle>
          <CardDescription>
            Aparecerán cuando se conecte la WhatsApp Business Cloud API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(logs ?? []).length === 0 ? (
            <p className="text-sm text-brand-muted">Sin envíos registrados aún.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {logs!.map((l) => (
                <li key={l.id} className="flex items-center justify-between text-xs">
                  <span>{l.whatsapp}</span>
                  <Badge variant="outline">{l.status}</Badge>
                  <span className="text-brand-muted">{formatDate(l.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

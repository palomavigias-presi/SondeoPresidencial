import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCampaignAction } from "./actions";
import { formatDate } from "@/lib/utils";

export default async function CampaignsPage() {
  await requireAdmin("viewer");
  const supabase = await createSupabaseServerClient();
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name, description, status, channel, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-deep">Campañas WhatsApp</h1>
        <p className="text-sm text-brand-muted">
          Solo se envían mensajes a contactos con consentimiento expreso. La integración
          con WhatsApp Business Cloud API queda lista; mientras tanto, exporta a CSV.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nueva campaña</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCampaignAction} className="grid gap-3 md:grid-cols-3">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" name="description" rows={1} />
            </div>
            <Button type="submit">Crear campaña (borrador)</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {(campaigns ?? []).map((c) => (
          <Card key={c.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{c.name}</CardTitle>
                <p className="text-xs text-brand-muted">
                  Creada {formatDate(c.created_at)}
                </p>
              </div>
              <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-sm text-brand-muted">
                {c.description ?? "Sin descripción"}
              </p>
              <div className="mt-3 flex justify-end">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/campaigns/${c.id}`}>Abrir</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {(campaigns ?? []).length === 0 ? (
          <p className="text-sm text-brand-muted">Aún no hay campañas.</p>
        ) : null}
      </div>
    </div>
  );
}

function statusVariant(s: string): "default" | "secondary" | "success" | "destructive" | "muted" {
  if (s === "ready") return "success";
  if (s === "sent") return "default";
  if (s === "paused") return "secondary";
  if (s === "finished") return "muted";
  return "muted";
}

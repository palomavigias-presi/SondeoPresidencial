import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { publishPrivacyVersionAction } from "./actions";
import { formatDate } from "@/lib/utils";

export default async function SettingsPage() {
  await requireAdmin("super_admin");
  const supabase = await createSupabaseServerClient();

  const [{ data: versions }, { data: profiles }, { data: deletionRequests }] =
    await Promise.all([
      supabase
        .from("privacy_policy_versions")
        .select("*")
        .order("published_at", { ascending: false }),
      supabase.from("profiles").select("id, email, role, full_name, created_at"),
      supabase
        .from("data_deletion_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  const current = versions?.find((v) => v.is_current);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-deep">Configuración</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Política de tratamiento de datos</CardTitle>
          <CardDescription>
            Publica una nueva versión. La política se muestra en /privacidad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={publishPrivacyVersionAction} className="grid gap-3">
            <div>
              <Label htmlFor="version">Versión</Label>
              <Input
                id="version"
                name="version"
                placeholder="v1.1-2026"
                defaultValue=""
                required
              />
            </div>
            <div>
              <Label htmlFor="content_md">Contenido (Markdown)</Label>
              <Textarea
                id="content_md"
                name="content_md"
                rows={10}
                defaultValue={current?.content_md ?? ""}
                required
              />
            </div>
            <Button type="submit">Publicar como versión vigente</Button>
          </form>

          <div>
            <p className="text-sm font-medium">Versiones publicadas</p>
            <ul className="mt-2 space-y-1 text-sm">
              {(versions ?? []).map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-1.5"
                >
                  <span>
                    <span className="font-mono">{v.version}</span>{" "}
                    <span className="text-xs text-brand-muted">
                      {formatDate(v.published_at)}
                    </span>
                  </span>
                  {v.is_current ? <Badge variant="success">Vigente</Badge> : null}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Equipo administrador</CardTitle>
          <CardDescription>
            Crear usuarios desde Supabase → Authentication. Aquí solo cambias roles
            (con SQL):
            <code className="ml-1 rounded bg-slate-100 px-1 py-0.5 text-xs">
              update profiles set role = 'super_admin' where email = '…';
            </code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm">
            {(profiles ?? []).map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-1.5"
              >
                <span>{p.email}</span>
                <Badge variant="outline">{p.role}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Solicitudes de eliminación</CardTitle>
          <CardDescription>
            Las gestiona super_admin. Después de procesar, marca la fila como
            resuelta directamente en Supabase o crea una server action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm">
            {(deletionRequests ?? []).map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-1.5"
              >
                <span>
                  {d.whatsapp} ·{" "}
                  <span className="text-xs text-brand-muted">
                    {formatDate(d.created_at)}
                  </span>
                </span>
                <Badge variant={d.status === "pending" ? "destructive" : "muted"}>
                  {d.status}
                </Badge>
              </li>
            ))}
            {(deletionRequests ?? []).length === 0 ? (
              <p className="text-sm text-brand-muted">No hay solicitudes pendientes.</p>
            ) : null}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

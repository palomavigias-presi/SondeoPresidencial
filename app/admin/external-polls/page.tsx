import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalPollForm } from "@/components/admin/external-poll-form";
import { deleteExternalPollAction } from "./actions";
import { formatDate } from "@/lib/utils";

export default async function ExternalPollsAdmin() {
  await requireAdmin("campaign_manager");
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("external_polls")
    .select(
      "id, title, pollster, publication_date, source_url, technical_sheet, image_url, notes, visible, external_poll_results(candidate_name, percentage)",
    )
    .order("publication_date", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-deep">Encuestas externas</h1>
        <p className="text-sm text-brand-muted">
          Cargar mediciones publicadas por firmas encuestadoras. Aparecerán en{" "}
          <Link href="/resultados" className="underline">
            /resultados
          </Link>{" "}
          si están marcadas como visibles.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nueva encuesta externa</CardTitle>
        </CardHeader>
        <CardContent>
          <ExternalPollForm />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {(data ?? []).map((p) => (
          <Card key={p.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">{p.title}</CardTitle>
                <p className="text-xs text-brand-muted">
                  {p.pollster} · {formatDate(p.publication_date).split(",")[0]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={p.visible ? "success" : "muted"}>
                  {p.visible ? "Visible" : "Oculta"}
                </Badge>
                <form action={async () => {
                  "use server";
                  await deleteExternalPollAction(p.id);
                }}>
                  <Button type="submit" variant="ghost" size="sm">Eliminar</Button>
                </form>
              </div>
            </CardHeader>
            <CardContent>
              <details>
                <summary className="cursor-pointer text-sm font-medium text-brand-deep">
                  Editar
                </summary>
                <div className="mt-3">
                  <ExternalPollForm
                    initial={{
                      id: p.id,
                      title: p.title,
                      pollster: p.pollster,
                      publication_date: p.publication_date,
                      source_url: p.source_url,
                      technical_sheet: p.technical_sheet,
                      image_url: p.image_url,
                      notes: p.notes,
                      visible: p.visible,
                      results: ((p as unknown as { external_poll_results: Array<{ candidate_name: string; percentage: number }> }).external_poll_results) ?? [],
                    }}
                  />
                </div>
              </details>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

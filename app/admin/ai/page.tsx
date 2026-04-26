import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AiCenterPage() {
  await requireAdmin("viewer");
  const supabase = await createSupabaseServerClient();
  const { data: candidates } = await supabase
    .from("candidates")
    .select("id, name, party, active, candidate_proposals(id, topic)")
    .eq("active", true)
    .order("display_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-deep">
          Centro IA / propuestas
        </h1>
        <p className="text-sm text-brand-muted">
          La IA solo trabaja con propuestas que el equipo cargue manualmente.
          Más fuentes = mejores comparaciones. Estado actual:{" "}
          <strong>provider mock</strong>{" "}
          (cambia <code>AI_PROVIDER</code> en variables de entorno cuando integres
          OpenAI / Anthropic / Gemini).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reglas de la IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-brand-text">
          <Rule>No inventar propuestas. Solo usar fuentes cargadas en admin.</Rule>
          <Rule>Citar fuente con URL y nombre cuando se muestre una propuesta.</Rule>
          <Rule>Mostrar más de un candidato cuando aplique al tema.</Rule>
          <Rule>No usar lenguaje directivo como “debes votar por X”.</Rule>
          <Rule>
            Si no hay información: responder “No tengo información verificada
            suficiente sobre este punto.”
          </Rule>
          <Rule>
            Cuando el usuario marque afinidades de derecha / centro derecha /
            seguridad / autoridad, podrá aparecer Paloma Valencia, pero siempre
            explicando la razón y mostrando alternativas comparables.
          </Rule>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {(candidates ?? []).map((c) => {
          const topics = (c as unknown as { candidate_proposals: Array<{ topic: string }> }).candidate_proposals ?? [];
          const unique = Array.from(new Set(topics.map((t) => t.topic)));
          return (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <p className="text-xs text-brand-muted">{c.party ?? "—"}</p>
                </div>
                <Badge variant={topics.length > 0 ? "success" : "muted"}>
                  {topics.length} propuestas
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {unique.map((t) => (
                    <Badge key={t} variant="outline">
                      {t}
                    </Badge>
                  ))}
                  {unique.length === 0 ? (
                    <p className="text-sm text-brand-muted">
                      Aún no hay propuestas cargadas para este candidato.
                    </p>
                  ) : null}
                </div>
                <Link
                  href={`/admin/candidates/${c.id}`}
                  className="text-sm text-brand-deep hover:underline"
                >
                  + Cargar / editar propuestas
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Rule({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      • {children}
    </p>
  );
}

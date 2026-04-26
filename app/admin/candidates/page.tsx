import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function CandidatesPage() {
  await requireAdmin("viewer");
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("candidates")
    .select("id, name, party, color, active, display_order")
    .order("display_order");

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-deep">Candidatos</h1>
          <p className="text-sm text-brand-muted">
            Edita aquí los candidatos que aparecen en la primera pregunta del sondeo.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/candidates/new">+ Nuevo candidato</Link>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {(data ?? []).map((c) => (
          <Card key={c.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="h-9 w-9 rounded-full"
                  style={{ background: c.color ?? "#0D1B4B" }}
                />
                <div>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <p className="text-xs text-brand-muted">{c.party ?? "—"}</p>
                </div>
              </div>
              <Badge variant={c.active ? "success" : "muted"}>
                {c.active ? "Activo" : "Inactivo"}
              </Badge>
            </CardHeader>
            <CardContent className="flex justify-end gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/candidates/${c.id}`}>Editar / Propuestas</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

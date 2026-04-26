import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { CandidateForm } from "@/components/admin/candidate-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteCandidateAction,
  deleteProposalAction,
  upsertProposalAction,
} from "../actions";

export default async function EditCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin("campaign_manager");
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: candidate } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!candidate) notFound();

  const { data: proposals } = await supabase
    .from("candidate_proposals")
    .select("*")
    .eq("candidate_id", id)
    .order("topic");

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/candidates" className="text-sm text-brand-muted hover:underline">
          ← Volver
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-brand-deep">
          Editar: {candidate.name}
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del candidato</CardTitle>
          </CardHeader>
          <CardContent>
            <CandidateForm initial={candidate} />
            {admin.role === "super_admin" ? (
              <form
                action={async () => {
                  "use server";
                  await deleteCandidateAction(id);
                }}
                className="mt-4"
              >
                <Button type="submit" variant="destructive">
                  Eliminar candidato
                </Button>
              </form>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Propuestas y fuentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={upsertProposalAction} className="space-y-2 rounded-md border border-slate-200 p-3">
              <input type="hidden" name="candidate_id" value={id} />
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <Label htmlFor="topic">Tema</Label>
                  <Input id="topic" name="topic" placeholder="Seguridad, Economía…" required />
                </div>
                <div>
                  <Label htmlFor="source_name">Nombre de fuente</Label>
                  <Input id="source_name" name="source_name" placeholder="Plan de gobierno 2026" />
                </div>
              </div>
              <div>
                <Label htmlFor="source_url">URL de fuente</Label>
                <Input id="source_url" name="source_url" placeholder="https://…" />
              </div>
              <div>
                <Label htmlFor="proposal">Propuesta verificada</Label>
                <Textarea id="proposal" name="proposal" rows={3} required />
              </div>
              <Button type="submit">+ Agregar propuesta</Button>
            </form>

            <ul className="space-y-2">
              {(proposals ?? []).map((p) => (
                <li key={p.id} className="rounded-md border border-slate-200 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-deep">
                      {p.topic}
                    </p>
                    <form action={async () => {
                      "use server";
                      await deleteProposalAction(p.id, id);
                    }}>
                      <button className="text-xs text-red-600 hover:underline">
                        Eliminar
                      </button>
                    </form>
                  </div>
                  <p className="mt-1 text-brand-text">{p.proposal}</p>
                  {p.source_url ? (
                    <a
                      className="mt-1 block text-xs text-brand-deep underline"
                      href={p.source_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {p.source_name ?? p.source_url}
                    </a>
                  ) : (
                    <p className="mt-1 text-xs text-brand-muted">
                      Sin fuente · agrégala antes de mostrar al público.
                    </p>
                  )}
                </li>
              ))}
              {(proposals ?? []).length === 0 ? (
                <p className="text-sm text-brand-muted">Sin propuestas cargadas.</p>
              ) : null}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

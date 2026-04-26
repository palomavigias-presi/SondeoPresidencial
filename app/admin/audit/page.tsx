import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 100;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AuditPage({ searchParams }: PageProps) {
  await requireAdmin("viewer");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createSupabaseServerClient();
  const { data: rows, count } = await supabase
    .from("audit_logs")
    .select("id, action, entity, entity_id, metadata, created_at, profiles(email)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-deep">Auditoría</h1>
        <p className="text-sm text-brand-muted">{count ?? 0} eventos.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Eventos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Entidad</TableHead>
                <TableHead>Detalles</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(rows ?? []).map((r) => {
                const actor = (r as unknown as { profiles: { email: string } | null }).profiles;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs text-brand-muted">
                      {formatDate(r.created_at)}
                    </TableCell>
                    <TableCell className="text-xs">{actor?.email ?? "—"}</TableCell>
                    <TableCell className="text-xs font-mono">{r.action}</TableCell>
                    <TableCell className="text-xs">
                      {r.entity}
                      {r.entity_id ? `:${r.entity_id.slice(0, 8)}` : ""}
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.metadata ? (
                        <pre className="max-w-md overflow-x-auto rounded bg-slate-50 p-1 text-[10px]">
                          {JSON.stringify(r.metadata, null, 2)}
                        </pre>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {(rows ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-brand-muted">
                    Sin eventos.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

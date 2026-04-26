import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DEPARTMENTS, REGIONS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    department?: string;
    region?: string;
    status?: string;
    source?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 25;

export default async function ParticipantsPage({ searchParams }: PageProps) {
  const admin = await requireAdmin("viewer");
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();

  const page = Math.max(1, Number(sp.page ?? 1));
  const offset = (page - 1) * PAGE_SIZE;

  // Por defecto ocultamos los simulados — el admin tiene que seleccionarlos
  // explícitamente para evitar confusión con datos reales.
  const sourceFilter = sp.source ?? "real";

  let query = supabase
    .from("participants")
    .select(
      "id, full_name, whatsapp, department, municipality, region, status, consent_whatsapp, referral_code, source, created_at, referred_by",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (sp.q) {
    query = query.or(`full_name.ilike.%${sp.q}%,whatsapp.ilike.%${sp.q}%`);
  }
  if (sp.department) query = query.eq("department", sp.department);
  if (sp.region) query = query.eq("region", sp.region);
  if (sp.status) query = query.eq("status", sp.status);
  if (sourceFilter === "simulated") query = query.eq("source", "simulated");
  else if (sourceFilter === "real")
    query = query.or("source.is.null,source.neq.simulated");
  // sourceFilter === "all" → no filter

  // Conteos auxiliares para los chips
  const [realCountRes, simCountRes] = await Promise.all([
    supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .or("source.is.null,source.neq.simulated"),
    supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .eq("source", "simulated"),
  ]);
  const realCount = realCountRes.count ?? 0;
  const simCount = simCountRes.count ?? 0;

  const { data, count } = await query;
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Anonimizar si rol = analyst
  const isAnalyst = admin.role === "analyst";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-brand-deep">Participantes</h1>
          <p className="text-sm text-brand-muted">
            {total} registros mostrados ·{" "}
            <SourceFilterLabel filter={sourceFilter} />
            {sp.q ? ` · búsqueda: "${sp.q}"` : ""}
          </p>
        </div>
        {admin.role === "super_admin" ? (
          <Button asChild variant="outline">
            <Link
              href={`/admin/participants/export${sourceFilter === "simulated" ? "?source=simulated" : ""}`}
              prefetch={false}
            >
              Exportar CSV
            </Link>
          </Button>
        ) : null}
      </div>

      <SourceFilterChips
        current={sourceFilter}
        realCount={realCount}
        simCount={simCount}
        sp={sp}
      />

      <form className="flex flex-wrap items-end gap-2 rounded-md border border-slate-200 bg-white p-3">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs uppercase tracking-wider text-brand-muted">
            Buscar
          </label>
          <Input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Nombre o WhatsApp"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-brand-muted">
            Departamento
          </label>
          <select
            name="department"
            defaultValue={sp.department ?? ""}
            className="h-11 rounded-md border border-slate-300 bg-white px-3"
          >
            <option value="">Todos</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-brand-muted">
            Región
          </label>
          <select
            name="region"
            defaultValue={sp.region ?? ""}
            className="h-11 rounded-md border border-slate-300 bg-white px-3"
          >
            <option value="">Todas</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-brand-muted">
            Estado
          </label>
          <select
            name="status"
            defaultValue={sp.status ?? ""}
            className="h-11 rounded-md border border-slate-300 bg-white px-3"
          >
            <option value="">Todos</option>
            <option value="registered">Registrado</option>
            <option value="responded">Respondió</option>
            <option value="incomplete">Incompleto</option>
            <option value="do_not_contact">No contactar</option>
            <option value="anonymized">Anonimizado</option>
            <option value="deletion_requested">Pidió eliminación</option>
          </select>
        </div>
        <Button type="submit">Filtrar</Button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Opt-in</TableHead>
              <TableHead>Ref. code</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((p) => (
              <TableRow
                key={p.id}
                className={p.source === "simulated" ? "bg-amber-50/40" : undefined}
              >
                <TableCell className="font-medium">
                  {isAnalyst ? maskName(p.full_name) : p.full_name}
                </TableCell>
                <TableCell>
                  {isAnalyst ? maskPhone(p.whatsapp) : p.whatsapp}
                </TableCell>
                <TableCell>
                  <SourceBadge source={p.source} />
                </TableCell>
                <TableCell>
                  <span className="text-sm">{p.department || "—"}</span>
                  <p className="text-xs text-brand-muted">
                    {p.municipality || ""}
                  </p>
                </TableCell>
                <TableCell>
                  <StatusBadge status={p.status} />
                </TableCell>
                <TableCell>
                  {p.consent_whatsapp ? (
                    <Badge variant="success">Sí</Badge>
                  ) : (
                    <Badge variant="muted">No</Badge>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {p.referral_code}
                </TableCell>
                <TableCell className="text-xs text-brand-muted">
                  {formatDate(p.created_at)}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/participants/${p.id}`}
                    className="text-sm font-medium text-brand-deep hover:underline"
                  >
                    Ver
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {(data ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-sm text-brand-muted">
                  Sin resultados.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <Pagination page={page} totalPages={totalPages} sp={sp} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { v: "default" | "secondary" | "success" | "muted" | "destructive"; label: string }> = {
    registered: { v: "secondary", label: "Registrado" },
    responded: { v: "success", label: "Respondió" },
    incomplete: { v: "muted", label: "Incompleto" },
    do_not_contact: { v: "destructive", label: "No contactar" },
    anonymized: { v: "muted", label: "Anonimizado" },
    deletion_requested: { v: "destructive", label: "Eliminación" },
  };
  const x = map[status] ?? { v: "muted" as const, label: status };
  return <Badge variant={x.v}>{x.label}</Badge>;
}

function Pagination({
  page,
  totalPages,
  sp,
}: {
  page: number;
  totalPages: number;
  sp: Record<string, string | undefined>;
}) {
  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (v && k !== "page") params.set(k, v);
    });
    params.set("page", String(p));
    return `?${params.toString()}`;
  };
  return (
    <div className="flex items-center justify-between text-sm">
      <p className="text-brand-muted">
        Página {page} de {totalPages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={buildHref(page - 1)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5">
            Anterior
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link href={buildHref(page + 1)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5">
            Siguiente
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function maskName(name: string): string {
  const [first, ...rest] = name.split(" ");
  return `${first} ${rest.map((r) => `${r.charAt(0)}.`).join(" ")}`;
}
function maskPhone(p: string): string {
  return p.replace(/(\+?\d{3})\d+(\d{3})/, "$1******$2");
}

function SourceBadge({ source }: { source: string | null }) {
  if (source === "simulated")
    return <Badge variant="accent">Simulado</Badge>;
  if (!source) return <Badge variant="success">Real</Badge>;
  return <Badge variant="outline">{source}</Badge>;
}

function SourceFilterLabel({ filter }: { filter: string }) {
  if (filter === "simulated")
    return <span className="text-amber-700">solo simulados</span>;
  if (filter === "all") return <span>real + simulados</span>;
  return <span className="text-emerald-700">solo reales</span>;
}

function SourceFilterChips({
  current,
  realCount,
  simCount,
  sp,
}: {
  current: string;
  realCount: number;
  simCount: number;
  sp: Record<string, string | undefined>;
}) {
  const buildHref = (s: string) => {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (v && k !== "source" && k !== "page") params.set(k, v);
    });
    params.set("source", s);
    return `?${params.toString()}`;
  };
  const Chip = ({
    value,
    label,
    count,
    tone,
  }: {
    value: string;
    label: string;
    count?: number;
    tone: "real" | "sim" | "all";
  }) => {
    const active = current === value;
    const toneClasses = active
      ? tone === "real"
        ? "bg-emerald-600 text-white border-emerald-600"
        : tone === "sim"
          ? "bg-brand-accent text-brand-ink border-brand-accent"
          : "bg-brand-deep text-white border-brand-deep"
      : "bg-white text-brand-text border-slate-300 hover:border-brand-deep/40";
    return (
      <Link
        href={buildHref(value)}
        prefetch={false}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${toneClasses}`}
      >
        {label}
        {typeof count === "number" ? (
          <span className="font-mono text-[10px] tabular-nums opacity-90">
            {count.toLocaleString("es-CO")}
          </span>
        ) : null}
      </Link>
    );
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">
        Fuente:
      </span>
      <Chip value="real" label="Reales" count={realCount} tone="real" />
      <Chip value="simulated" label="Simulados" count={simCount} tone="sim" />
      <Chip value="all" label="Todos" count={realCount + simCount} tone="all" />
    </div>
  );
}

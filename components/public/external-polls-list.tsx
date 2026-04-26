import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { formatDate, formatPercent } from "@/lib/utils";

export interface ExternalPollWithResults {
  id: string;
  title: string;
  pollster: string;
  publication_date: string;
  source_url: string;
  technical_sheet: string | null;
  notes: string | null;
  image_url: string | null;
  results: Array<{ candidate_name: string; percentage: number }>;
}

export function ExternalPollsList({ polls }: { polls: ExternalPollWithResults[] }) {
  if (polls.length === 0) {
    return (
      <p className="rounded-md border border-slate-200 bg-white p-4 text-sm text-brand-muted">
        Aún no hay encuestas externas cargadas. El equipo administrador puede
        subirlas desde el panel.
      </p>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {polls.map((p) => (
        <article
          key={p.id}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-brand-muted">
              {p.pollster} · {formatDate(p.publication_date).split(",")[0]}
            </p>
            <Link
              href={p.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand-deep hover:underline"
            >
              Fuente <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <h3 className="mt-1 text-lg font-semibold text-brand-text">{p.title}</h3>
          {p.technical_sheet ? (
            <p className="mt-1 text-xs text-brand-muted">{p.technical_sheet}</p>
          ) : null}
          <ul className="mt-4 space-y-1 text-sm">
            {p.results
              .sort((a, b) => b.percentage - a.percentage)
              .slice(0, 8)
              .map((r) => (
                <li
                  key={`${r.candidate_name}`}
                  className="flex items-center justify-between"
                >
                  <span className="text-brand-text">{r.candidate_name}</span>
                  <span className="font-mono text-brand-muted">
                    {formatPercent(r.percentage / 100)}
                  </span>
                </li>
              ))}
          </ul>
          {p.notes ? (
            <p className="mt-3 text-xs italic text-brand-muted">{p.notes}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

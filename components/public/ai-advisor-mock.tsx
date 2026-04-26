import Link from "next/link";
import { Sparkles, ExternalLink } from "lucide-react";
import type { AffinityResult } from "@/lib/ai/advisor";

interface AiAdvisorMockProps {
  result: AffinityResult;
}

export function AiAdvisorMock({ result }: AiAdvisorMockProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand-accent" />
        <h3 className="text-base font-semibold text-brand-deep">
          Comparación de propuestas según tus prioridades
        </h3>
      </div>
      {result.topPriorities.length === 0 ? (
        <p className="mt-3 text-sm text-brand-muted">
          {result.disclaimer}
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-brand-text">
            Tus prioridades declaradas: <strong>{result.topPriorities.join(", ")}</strong>.
          </p>
          {result.matches.length === 0 ? (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              No tengo todavía propuestas verificadas cargadas para estos temas.
              Revisa los enlaces oficiales de cada candidatura.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {result.matches.map((m) => (
                <li
                  key={m.candidate_id}
                  className="rounded-lg border border-slate-200 bg-brand-bg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-brand-text">
                        {m.candidate_name}
                      </p>
                      <p className="text-xs text-brand-muted">{m.rationale}</p>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm">
                    {m.proposals.map((p, i) => (
                      <li key={i} className="rounded-md bg-white p-3 ring-1 ring-slate-100">
                        <p className="text-xs font-medium uppercase tracking-wider text-brand-deep">
                          {p.topic}
                        </p>
                        <p className="mt-1 text-sm text-brand-text">{p.proposal}</p>
                        {p.source_url ? (
                          <Link
                            href={p.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs text-brand-deep underline-offset-2 hover:underline"
                          >
                            Fuente: {p.source_name ?? p.source_url}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <p className="mt-2 text-xs text-brand-muted">
                            Sin fuente cargada · pide al equipo subir referencia.
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-brand-muted">{result.disclaimer}</p>
        </>
      )}
    </section>
  );
}

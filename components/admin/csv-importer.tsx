"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { importContactsCsvAction, type ImportSummary } from "@/app/admin/campaigns/actions";

export function CsvImporter({ campaignId }: { campaignId: string }) {
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const result = await importContactsCsvAction(campaignId, fd);
            setSummary(result);
          });
        }}
        className="space-y-3"
      >
        <div>
          <Label htmlFor="csv">Archivo CSV</Label>
          <p className="text-xs text-brand-muted">
            Columnas esperadas: nombre, whatsapp, departamento, municipio, region,
            etiqueta, fuente, consentimiento_whatsapp, campaña
          </p>
          <Input id="csv" name="csv" type="file" accept=".csv,text/csv" required />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Importando…" : "Importar"}
        </Button>
      </form>
      {summary ? (
        <div className="mt-4 space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <p>
            Procesadas: <strong>{summary.total}</strong> · Válidas con opt-in:{" "}
            <strong className="text-emerald-700">{summary.valid}</strong> · Sin opt-in
            (rechazados): <strong className="text-amber-700">{summary.noOptIn}</strong>{" "}
            · Duplicados: <strong>{summary.duplicates}</strong> · Inválidos:{" "}
            <strong className="text-red-700">{summary.invalid}</strong>
          </p>
          {summary.errors.length > 0 ? (
            <details>
              <summary className="cursor-pointer text-xs text-brand-muted">
                Ver errores ({summary.errors.length})
              </summary>
              <ul className="mt-1 space-y-0.5 text-xs text-red-700">
                {summary.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { upsertExternalPollAction } from "@/app/admin/external-polls/actions";
import { X, Plus } from "lucide-react";

interface PollResult {
  candidate_name: string;
  percentage: number;
}

interface Props {
  initial?: {
    id?: string;
    title?: string;
    pollster?: string;
    publication_date?: string;
    source_url?: string;
    technical_sheet?: string | null;
    image_url?: string | null;
    notes?: string | null;
    visible?: boolean;
    results?: PollResult[];
  };
}

export function ExternalPollForm({ initial }: Props) {
  const [results, setResults] = useState<PollResult[]>(initial?.results ?? []);

  return (
    <form action={upsertExternalPollAction} className="space-y-4">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="results_json" value={JSON.stringify(results)} />

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" defaultValue={initial?.title ?? ""} required />
        </div>
        <div>
          <Label htmlFor="pollster">Firma encuestadora</Label>
          <Input id="pollster" name="pollster" defaultValue={initial?.pollster ?? ""} required />
        </div>
        <div>
          <Label htmlFor="publication_date">Fecha de publicación</Label>
          <Input
            id="publication_date"
            name="publication_date"
            type="date"
            defaultValue={initial?.publication_date ?? ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="source_url">URL fuente</Label>
          <Input id="source_url" name="source_url" defaultValue={initial?.source_url ?? ""} required />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="technical_sheet">Ficha técnica</Label>
          <Textarea
            id="technical_sheet"
            name="technical_sheet"
            rows={2}
            defaultValue={initial?.technical_sheet ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="image_url">Imagen / PDF (URL)</Label>
          <Input id="image_url" name="image_url" defaultValue={initial?.image_url ?? ""} />
        </div>
        <div className="flex items-end gap-2">
          <Checkbox id="visible" name="visible" defaultChecked={initial?.visible ?? true} />
          <Label htmlFor="visible">Visible en el sitio público</Label>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="notes">Observaciones</Label>
          <Textarea id="notes" name="notes" rows={2} defaultValue={initial?.notes ?? ""} />
        </div>
      </div>

      <div className="rounded-md border border-slate-200 p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Resultados por candidato (%)</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setResults((r) => [...r, { candidate_name: "", percentage: 0 }])}
          >
            <Plus className="h-4 w-4" /> Agregar
          </Button>
        </div>
        <ul className="mt-2 space-y-2">
          {results.map((r, i) => (
            <li key={i} className="grid grid-cols-12 items-center gap-2">
              <Input
                className="col-span-7"
                placeholder="Candidato"
                value={r.candidate_name}
                onChange={(e) =>
                  setResults((rs) =>
                    rs.map((x, j) => (j === i ? { ...x, candidate_name: e.target.value } : x)),
                  )
                }
              />
              <Input
                className="col-span-4"
                type="number"
                step="0.01"
                placeholder="%"
                value={r.percentage}
                onChange={(e) =>
                  setResults((rs) =>
                    rs.map((x, j) =>
                      j === i ? { ...x, percentage: Number(e.target.value) } : x,
                    ),
                  )
                }
              />
              <button
                type="button"
                className="col-span-1 text-red-600"
                onClick={() => setResults((rs) => rs.filter((_, j) => j !== i))}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Button type="submit" size="lg">Guardar encuesta externa</Button>
    </form>
  );
}

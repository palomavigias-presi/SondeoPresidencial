"use client";

import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { upsertCandidateAction } from "@/app/admin/candidates/actions";

interface Props {
  initial?: {
    id?: string;
    name?: string;
    party?: string | null;
    bio?: string | null;
    photo_url?: string | null;
    color?: string | null;
    active?: boolean;
    display_order?: number;
  };
}

const initialState: { ok: boolean; message?: string } = { ok: false };

export function CandidateForm({ initial }: Props) {
  const [state, action] = useFormState(upsertCandidateAction, initialState);
  return (
    <form action={action} className="space-y-4">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <Field label="Nombre" name="name" defaultValue={initial?.name ?? ""} required />
      <Field label="Partido / movimiento" name="party" defaultValue={initial?.party ?? ""} />
      <Field label="Foto (URL)" name="photo_url" defaultValue={initial?.photo_url ?? ""} />
      <Field label="Color de marca (#hex)" name="color" defaultValue={initial?.color ?? ""} />
      <Field
        label="Orden de visualización"
        name="display_order"
        type="number"
        defaultValue={String(initial?.display_order ?? 0)}
      />
      <div className="space-y-1.5">
        <Label htmlFor="bio">Biografía breve</Label>
        <Textarea id="bio" name="bio" rows={4} defaultValue={initial?.bio ?? ""} />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="active" name="active" defaultChecked={initial?.active ?? true} />
        <Label htmlFor="active">Activo (visible en el sondeo)</Label>
      </div>
      {state.message ? <p className="text-sm text-red-600">{state.message}</p> : null}
      {state.ok ? <p className="text-sm text-emerald-700">Guardado.</p> : null}
      <Button type="submit" size="lg">Guardar</Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue = "",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
      />
    </div>
  );
}

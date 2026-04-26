"use client";

import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requestDeletionAction, type DeletionState } from "./actions";

const initial: DeletionState = { ok: false };

export default function EliminarPage() {
  const [state, action] = useFormState(requestDeletionAction, initial);

  return (
    <div className="container-narrow py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-brand-accent">
        Tus derechos
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-brand-deep">
        Solicitar eliminación o rectificación
      </h1>
      <p className="mt-3 text-sm text-brand-muted">
        Ingresa el WhatsApp con el que te registraste. Procesamos tu solicitud
        siguiendo los plazos de la Ley 1581 de 2012.
      </p>

      {state.ok ? (
        <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {state.message}
        </div>
      ) : null}

      <form action={action} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">Número de WhatsApp</Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            placeholder="+57 300 123 4567"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reason">Motivo (opcional)</Label>
          <Textarea
            id="reason"
            name="reason"
            placeholder="Cuéntanos brevemente qué deseas que hagamos."
            rows={4}
          />
        </div>
        {state.message && !state.ok ? (
          <p className="text-sm text-red-600">{state.message}</p>
        ) : null}
        <Button type="submit" size="lg">
          Enviar solicitud
        </Button>
      </form>
    </div>
  );
}

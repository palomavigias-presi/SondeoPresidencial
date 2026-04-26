"use client";

import { useFormState } from "react-dom";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginAction, type LoginState } from "./actions";
import { SITE_NAME } from "@/lib/constants";

const initial: LoginState = { ok: false };

export default function AdminLoginPage() {
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/admin";
  const [state, action] = useFormState(loginAction, initial);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Acceso administradores</CardTitle>
          <CardDescription>
            Solo personal autorizado de {SITE_NAME}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" name="email" type="email" required autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {state.message ? (
              <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                {state.message}
              </p>
            ) : null}
            <Button type="submit" className="w-full" size="lg">
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

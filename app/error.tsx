"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <html lang="es-CO">
      <body className="flex min-h-screen items-center justify-center bg-brand-bg p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-brand-deep">
            Ocurrió un error inesperado
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            Vuelve a intentarlo o revisa los logs si eres administrador.
          </p>
          <Button onClick={reset} className="mt-4">
            Reintentar
          </Button>
        </div>
      </body>
    </html>
  );
}

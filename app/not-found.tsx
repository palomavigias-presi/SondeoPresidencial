import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bg p-6 text-center">
      <p className="text-sm font-medium uppercase tracking-wider text-brand-accent">
        404
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-brand-deep">
        Página no encontrada
      </h1>
      <p className="mt-2 max-w-md text-sm text-brand-muted">
        La página que buscas no existe o fue movida. Vuelve a la página
        principal del sondeo.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}

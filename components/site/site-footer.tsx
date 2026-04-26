import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export function SiteFooter() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "privacidad@pulsocolombia2026.co";
  const adminOrg = process.env.ADMIN_ORG ?? SITE_NAME;
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div aria-hidden className="h-1 flag-stripe" />
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-brand-deep">
            Plataforma ciudadana
          </p>
          <p className="mt-1 text-base font-semibold text-brand-deep">{SITE_NAME}</p>
          <p className="mt-2 max-w-md text-sm text-brand-muted">
            Sondeo ciudadano voluntario. Los resultados públicos son agregados.
            Esta no es una encuesta probabilística oficial.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-text">Plataforma</p>
          <ul className="mt-2 space-y-1 text-sm text-brand-muted">
            <li>
              <Link href="/" className="hover:text-brand-deep">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/participar" className="hover:text-brand-deep">
                Participar
              </Link>
            </li>
            <li>
              <Link href="/resultados" className="hover:text-brand-deep">
                Resultados agregados
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-text">Legal y datos</p>
          <ul className="mt-2 space-y-1 text-sm text-brand-muted">
            <li>
              <Link href="/privacidad" className="hover:text-brand-deep">
                Política de tratamiento de datos
              </Link>
            </li>
            <li>
              <Link href="/eliminar-mis-datos" className="hover:text-brand-deep">
                Solicitar eliminación
              </Link>
            </li>
            <li>
              Responsable: <span className="text-brand-text">{adminOrg}</span>
            </li>
            <li>
              <a href={`mailto:${adminEmail}`} className="hover:text-brand-deep">
                {adminEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-4 text-xs text-brand-muted md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} {adminOrg}. Plataforma con consentimiento
            previo según Ley 1581 de 2012 y Decreto 1377 de 2013.
          </p>
          <Link href="/admin/login" className="hover:text-brand-deep">
            Acceso administradores
          </Link>
        </div>
      </div>
    </footer>
  );
}

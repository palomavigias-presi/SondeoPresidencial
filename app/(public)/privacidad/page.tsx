import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Política de tratamiento de datos",
  description:
    "Cómo tratamos los datos personales y sensibles de quienes participan en el sondeo.",
};

export default async function PrivacidadPage() {
  const supabase = await createSupabaseServerClient();
  const { data: policy } = await supabase
    .from("privacy_policy_versions")
    .select("version, content_md, published_at")
    .eq("is_current", true)
    .maybeSingle();

  const adminEmail = process.env.ADMIN_EMAIL ?? "privacidad@pulsocolombia2026.co";
  const adminPhone = process.env.ADMIN_PHONE ?? "—";
  const adminOrg = process.env.ADMIN_ORG ?? "Pulso Colombia 2026";
  const adminAddress = process.env.ADMIN_ADDRESS ?? "Bogotá D.C., Colombia";

  return (
    <div className="container-narrow py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-brand-accent">
        Política
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-brand-deep">
        Política de tratamiento de datos personales
      </h1>
      <p className="mt-2 text-xs text-brand-muted">
        Versión {policy?.version ?? "v1.0-2026"} · Marco normativo: Ley 1581 de
        2012, Decreto 1377 de 2013 y normas concordantes.
      </p>

      <article className="prose prose-slate mt-8 max-w-none text-brand-text">
        <h2>1. Responsable del tratamiento</h2>
        <p>
          {adminOrg}. Domicilio: {adminAddress}. Correo de contacto:{" "}
          <a href={`mailto:${adminEmail}`}>{adminEmail}</a>. Teléfono:{" "}
          {adminPhone}.
        </p>

        <h2>2. Finalidades</h2>
        <ul>
          <li>Registrar tu participación en el sondeo ciudadano.</li>
          <li>Analizar resultados agregados de intención de voto y prioridades temáticas.</li>
          <li>Contactarte por WhatsApp cuando hayas dado autorización expresa.</li>
          <li>Gestionar campañas informativas y materiales comparativos de propuestas.</li>
          <li>Construir estadísticas territoriales y por región.</li>
        </ul>

        <h2>3. Datos recolectados</h2>
        <ul>
          <li>Nombre completo.</li>
          <li>Número de WhatsApp.</li>
          <li>Departamento, municipio y región.</li>
          <li>Datos opcionales: edad, género, ocupación.</li>
          <li>Respuestas al sondeo (incluye opinión política como dato sensible).</li>
          <li>Datos técnicos: fecha y hora, hash de IP, navegador, código de referido.</li>
        </ul>

        <h2>4. Datos sensibles</h2>
        <p>
          Las respuestas relacionadas con tu opinión política se consideran
          datos sensibles según la Ley 1581 de 2012. No estás obligado a
          responder estas preguntas y puedes retirar tu autorización en
          cualquier momento. El consentimiento para tratamiento de datos
          sensibles es independiente y opcional.
        </p>

        <h2>5. Derechos del titular</h2>
        <ul>
          <li>Conocer, actualizar y rectificar tus datos.</li>
          <li>Solicitar la supresión o eliminación de tus datos.</li>
          <li>Revocar la autorización otorgada.</li>
          <li>Acceder gratuitamente a los datos que te conciernen.</li>
        </ul>
        <p>
          Para ejercer tus derechos escribe a{" "}
          <a href={`mailto:${adminEmail}`}>{adminEmail}</a> o usa el formulario
          en <a href="/eliminar-mis-datos">/eliminar-mis-datos</a>.
        </p>

        <h2>6. Conservación</h2>
        <p>
          Conservamos los datos durante el tiempo necesario para cumplir con las
          finalidades descritas y luego se anonimizan o eliminan, salvo que
          exista deber legal de conservarlos.
        </p>

        <h2>7. Seguridad</h2>
        <p>
          Aplicamos controles técnicos y administrativos: cifrado en tránsito,
          control de acceso por rol, registro de auditoría y separación entre
          datos personales y resultados agregados. Los resultados públicos no
          revelan datos individuales.
        </p>

        <h2>8. Encargados / terceros</h2>
        <p>
          Usamos proveedores en la nube (alojamiento, base de datos y
          autenticación) que actúan como encargados del tratamiento. No
          comercializamos tus datos.
        </p>

        <h2>9. Vigencia</h2>
        <p>
          Esta política rige desde {new Date().toISOString().slice(0, 10)} y
          puede actualizarse. Las versiones se publican manteniendo la trazabilidad
          en el panel administrativo.
        </p>
      </article>

      {policy?.content_md ? (
        <details className="mt-8">
          <summary className="cursor-pointer text-sm font-medium text-brand-deep">
            Ver versión publicada vigente
          </summary>
          <pre className="mt-2 overflow-x-auto rounded-md bg-slate-50 p-4 text-xs text-brand-muted">
            {policy.content_md}
          </pre>
        </details>
      ) : null}
    </div>
  );
}

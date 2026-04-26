# Pulso Colombia 2026

Plataforma web de sondeo ciudadano transparente sobre la primera vuelta presidencial en Colombia. Construida con Next.js 15, TypeScript, Tailwind, shadcn/ui y Supabase. Diseñada para producción en Vercel.

> **Postura ética.** Esta plataforma trata datos personales y de opinión política. Cada decisión de UX, datos y producto debe respetar:
>
> - Consentimiento previo, expreso e informado (Ley 1581/2012, Decreto 1377/2013).
> - Resultados públicos solo agregados.
> - IA explicable, con fuentes verificables.
> - Sin lenguaje propagandístico (“debes votar por X”).

---

## Tabla de contenido

1. [Stack](#stack)
2. [Estructura del proyecto](#estructura-del-proyecto)
3. [Setup local](#setup-local)
4. [Variables de entorno](#variables-de-entorno)
5. [Despliegue paso a paso](#despliegue-paso-a-paso)
6. [Roles y RLS](#roles-y-rls)
7. [Flujo de usuario](#flujo-de-usuario)
8. [Pendientes para producción](#pendientes-para-producción)
9. [Convenciones](#convenciones)

---

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| UI | Tailwind CSS, shadcn/ui (components/ui) |
| Forms | React Hook Form + Zod |
| Datos | Supabase Postgres + RLS + vistas agregadas |
| Auth admin | Supabase Auth (email + password) |
| Gráficas | Recharts |
| CSV | csv-parse |
| Hosting | Vercel |

## Estructura del proyecto

```
.
├── app/
│   ├── (public)/              # Landing, registro, sondeo, resultados, privacidad
│   │   ├── page.tsx
│   │   ├── participar/
│   │   ├── resultados/
│   │   ├── privacidad/
│   │   └── eliminar-mis-datos/
│   ├── admin/                 # Panel administrativo (Supabase Auth)
│   │   ├── login/
│   │   ├── participants/
│   │   ├── responses/
│   │   ├── candidates/
│   │   ├── questions/
│   │   ├── campaigns/
│   │   ├── external-polls/
│   │   ├── ai/
│   │   ├── audit/
│   │   └── settings/
│   ├── layout.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/                    # shadcn/ui inline
│   ├── public/
│   ├── admin/
│   └── site/
├── lib/
│   ├── supabase/              # client / server / admin / middleware
│   ├── validators/            # Zod schemas
│   ├── ai/advisor.ts          # AI mock + interfaz para LLM real
│   ├── auth.ts                # roles + requireAdmin()
│   ├── constants.ts
│   ├── rate-limit.ts
│   ├── utils.ts
│   ├── whatsapp.ts            # capa WhatsApp Cloud API (TODO)
│   └── types/database.ts
├── supabase/
│   ├── migrations/0001_init.sql
│   ├── seed.sql
│   └── README.md
├── middleware.ts              # protege /admin
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
├── package.json
├── .env.example
└── README.md
```

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env.local con base en .env.example
cp .env.example .env.local

# 3. Provisionar Supabase (ver siguiente sección) y pegar las claves

# 4. Levantar el proyecto
npm run dev
```

Visita http://localhost:3000

Comandos útiles:

```bash
npm run dev         # desarrollo
npm run build       # build de producción
npm run start       # servir build
npm run lint        # ESLint
npm run typecheck   # TypeScript sin emitir
```

## Variables de entorno

Todas en `.env.example`. Las más críticas:

| Variable | Lado | Para qué |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | cliente y server | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | cliente y server | Lecturas públicas (vistas agregadas) |
| `SUPABASE_SERVICE_ROLE_KEY` | **solo server** | Inserts/updates desde server actions. NUNCA exponerla al cliente |
| `NEXT_PUBLIC_SITE_URL` | cliente | Construye los enlaces de referido en `/participar?ref=…` |
| `IP_HASH_SALT` | server | Salt para hashear la IP antes de guardarla |
| `ADMIN_EMAIL` / `ADMIN_PHONE` / `ADMIN_ORG` / `ADMIN_ADDRESS` | server | Datos del responsable del tratamiento (aparecen en `/privacidad`) |
| `WHATSAPP_PROVIDER_TOKEN` etc. | server | Para integrar WhatsApp Business Cloud API (TODO) |
| `AI_PROVIDER` / `AI_API_KEY` | server | `mock` por defecto. Cambia a `openai` / `anthropic` / `gemini` cuando integres |

## Despliegue paso a paso

### A. Supabase

1. Crea un proyecto en https://supabase.com.
2. SQL Editor → New query → pega `supabase/migrations/0001_init.sql` → Run.
3. New query → pega `supabase/seed.sql` → Run.
4. Authentication → Users → Add user. Crea el usuario administrador (email + password).
5. SQL Editor:
   ```sql
   update public.profiles
   set role = 'super_admin', full_name = 'Tu Nombre'
   where email = 'tu-correo@dominio.co';
   ```
6. Project Settings → API. Copia:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role → `SUPABASE_SERVICE_ROLE_KEY`

### B. GitHub

```bash
git init
git add .
git commit -m "feat: bootstrap Pulso Colombia 2026"
git branch -M main
git remote add origin git@github.com:<tu-org>/pulso-colombia-2026.git
git push -u origin main
```

### C. Vercel

1. https://vercel.com → New Project → Import del repo.
2. Framework: **Next.js** (autodetectado).
3. Environment variables → pegar todas las de `.env.example` reemplazando placeholders.
4. Deploy.

Después del primer deploy, configura tu dominio personalizado en Project → Domains.

### D. Postdespliegue

- Ingresa a `https://<tu-dominio>/admin/login` con el usuario que creaste.
- Visita `/admin/candidates` y revisa/edita los candidatos seed.
- Ve a `/admin/questions` y ajusta preguntas / opciones si los textos cambian.
- Edita la política en `/admin/settings` (publica una nueva versión cuando confirmes datos del responsable real).
- Carga tus encuestas externas en `/admin/external-polls`.

## Roles y RLS

| Rol | Permisos |
| --- | --- |
| `super_admin` | Todo: editar candidatos, preguntas, campañas, exportar CSV completo, anonimizar/eliminar participantes, publicar política. |
| `campaign_manager` | Editar candidatos, preguntas, campañas, encuestas externas. Marcar “no contactar”. **No** anonimizar/eliminar. |
| `analyst` | Ver participantes (datos personales **enmascarados**), ver respuestas, ver auditoría. No exporta. |
| `viewer` | Solo lectura del dashboard. |

Las RLS están definidas en `supabase/migrations/0001_init.sql` y validan también vía `current_admin_role()` (helper que lee `profiles.role`).

## Flujo de usuario

```
Landing /
  └─ Click “Responder sondeo”
     └─ /participar?ref=ABC123
        ├─ Datos básicos + 3 consentimientos
        └─ Crear participante (server action) → /participar/sondeo?pid=...
           ├─ 6 preguntas (administrables) en stepper mobile-first
           └─ Guarda survey_responses + survey_answers respetando consent_sensitive_political_data
              └─ /participar/gracias?pid=...
                 ├─ Mensaje neutral + perfil temático
                 ├─ ShareWhatsAppCard (link personalizado, registra share_event)
                 └─ AiAdvisorMock (compara propuestas según prioridades)
```

Resultados públicos siempre vía vistas: `/resultados` lee de `v_public_results`, `v_public_summary`, `v_participation_by_day`.

## Pendientes para producción

### WhatsApp Business Cloud API (alta prioridad)
Archivo: `lib/whatsapp.ts`. Implementar `sendTemplate` contra `graph.facebook.com/v20.0/{phone-number-id}/messages` usando `WHATSAPP_PROVIDER_TOKEN`. Reglas:
- **Solo enviar a contactos con `has_opt_in = true` y/o `consent_whatsapp = true`.**
- Persistir cada envío en `message_logs` con su `provider_message_id` y status (sent/delivered/read/failed).
- Webhook entrante para `delivered`, `read`, `failed`, `replied`, `unsubscribed` → actualizar `message_logs` y, si `unsubscribed`, marcar `status = 'do_not_contact'` en `participants`.

### IA real
Archivo: `lib/ai/advisor.ts`. Hoy usa `MockAdvisor` que solo combina propuestas guardadas. Para conectar OpenAI/Anthropic/Gemini:
1. Implementar una clase que cumpla `AiProvider`.
2. En `getAdvisor()`, leer `process.env.AI_PROVIDER` y construir el cliente.
3. **Mantener las reglas duras**: citar fuentes, no usar lenguaje directivo, decir “no tengo información verificada suficiente” cuando aplique. Validar la respuesta antes de mostrarla.

### Mapas
Si quieren visualización por departamento sobre mapa, integrar Leaflet con un GeoJSON oficial del DANE. Hoy mostramos top departamentos como barras horizontales (suficiente para MVP).

### Embeddings y RAG sobre propuestas
Crear tabla `candidate_proposal_embeddings` con `pgvector`, indexar `candidate_proposals.proposal`, y añadir un step de retrieve-then-explain en el advisor.

### Tests
- E2E del flujo público con Playwright (registro → sondeo → gracias).
- Unit tests en `lib/validators/*` y `lib/utils.ts`.
- Tests de RLS con Supabase CLI (`supabase db test`).

### Observabilidad
- Sentry para captura de errores.
- Vercel Analytics o Plausible para tráfico.
- Alertas: spike de registros desde una sola IP, intentos fallidos de admin login.

### Hardening
- Reemplazar el `rateLimit` en memoria por Upstash Redis (multi-instancia).
- Añadir CAPTCHA (Turnstile) en `/participar` y `/eliminar-mis-datos` antes de producción masiva.
- Auditar export endpoints contra IDOR y RLS bypass.
- Generar tipos Supabase con `supabase gen types typescript`.

## Convenciones

- **Server-only secrets**: nunca importar `lib/supabase/admin.ts` desde un componente cliente.
- **Validación**: cualquier entrada de usuario pasa por un schema en `lib/validators/`. Validar en cliente y volver a validar en server actions.
- **Datos sensibles**: si `consent_sensitive_political_data === false`, no persistir respuestas de preguntas con `is_sensitive = true` ligadas al participante. Ya implementado en `submitSurveyAction`.
- **No hardcodear candidatos**: si necesitas referenciar uno en la UI, hazlo por `id` o `display_order`. La tabla `candidates` es la fuente de verdad.
- **Auditoría**: toda acción admin que mute datos personales pasa por `logAudit()` en `app/admin/participants/actions.ts` (replicar para nuevas acciones).

---

Mantén la transparencia como atributo de producto, no solo de marketing. Si una funcionalidad nueva no se puede explicar al usuario en una frase, no debe entrar.

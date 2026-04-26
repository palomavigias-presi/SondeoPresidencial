# TODO — Pulso Colombia 2026

## Críticos antes de producción
- [ ] Reemplazar `lib/rate-limit.ts` (en memoria) por Upstash Redis para que funcione en Vercel multi-región.
- [ ] CAPTCHA en `/participar` y `/eliminar-mis-datos` (Cloudflare Turnstile).
- [ ] Configurar dominio en Vercel y `NEXT_PUBLIC_SITE_URL` con HTTPS.
- [ ] Confirmar **datos reales del responsable de tratamiento** y publicarlos en `/privacidad` desde `/admin/settings` antes del primer envío masivo.
- [ ] Validar política de tratamiento con asesor legal local (Ley 1581 / Decreto 1377 / norma electoral aplicable).
- [ ] Cargar al menos 2 propuestas verificadas por candidato (con fuente) antes de activar `AiAdvisorMock` en producción.

## WhatsApp Business Cloud API
- [ ] Implementar `sendTemplate` en `lib/whatsapp.ts`.
- [ ] Crear `app/api/whatsapp/webhook/route.ts` para procesar `delivered/read/failed/unsubscribed`.
- [ ] Endpoint `app/api/whatsapp/send/[campaignId]/route.ts` (rol `super_admin` o `campaign_manager`).
- [ ] Persistir todos los eventos en `message_logs`.
- [ ] Manejar opt-out: si `unsubscribed`, actualizar `participants.status = 'do_not_contact'` y `consent_whatsapp = false`.

## IA explicable
- [ ] Implementar `OpenAiAdvisor` / `AnthropicAdvisor` / `GeminiAdvisor` cumpliendo `AiProvider`.
- [ ] Embeddings con `pgvector` sobre `candidate_proposals.proposal` (tabla nueva: `candidate_proposal_embeddings`).
- [ ] Step de retrieve antes de explicar.
- [ ] Tests: validar que el output siempre cite fuentes y nunca use lenguaje directivo.

## Datos / analítica
- [ ] Vista `v_results_by_region` y `v_results_by_municipality` para filtros públicos.
- [ ] Endpoint `/api/results.json` para terceros (solo agregados).
- [ ] Mapa coroplético por departamento (Leaflet + GeoJSON DANE).
- [ ] Funnel: registrados → respondieron → compartieron.

## Admin
- [ ] CRUD para gestionar `data_deletion_requests` (cerrar / borrar / anonimizar).
- [ ] Filtros avanzados en `/admin/responses` (candidato, tema, campaña, referidor).
- [ ] Vista de **árbol de referidos** completa con D3 o react-flow.
- [ ] Importador de CSV con vista previa antes de confirmar.

## Calidad y seguridad
- [ ] Tests unitarios para `lib/validators` y `lib/utils`.
- [ ] Tests E2E con Playwright para flujo público.
- [ ] Tests de RLS con Supabase CLI.
- [ ] Sentry para errores.
- [ ] Generar tipos automáticos: `supabase gen types typescript --project-id <id> > lib/types/database.generated.ts`.
- [ ] Auditar `app/admin/**/route.ts` y `actions.ts` para verificar `requireAdmin()` y rol mínimo correcto.

## UX
- [ ] Skeleton loaders en `/admin/*` listas.
- [ ] Toasts de confirmación tras acciones admin (shadcn/ui toast).
- [ ] Modo oscuro (opcional).
- [ ] OG images dinámicas para `/`, `/resultados`, `/participar?ref=…`.

## Legal y comunicación
- [ ] Pie de página con aviso “No es encuesta probabilística oficial” siempre visible (✅ ya está).
- [ ] Página `/sobre` con equipo, fuentes de financiamiento y contacto.
- [ ] Aviso visible cuando un candidato del seed no tenga propuestas cargadas (para evitar sesgo por ausencia de datos).

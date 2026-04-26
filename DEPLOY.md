# Despliegue rápido

> Tiempo estimado: 30 minutos en limpio.

## 1. Supabase (10 min)

1. Crear proyecto en https://supabase.com → guardar la región (recomendado `sa-east-1` o `us-east-1`).
2. SQL Editor → New query.
3. Pegar y ejecutar **`supabase/migrations/0001_init.sql`**.
4. Pegar y ejecutar **`supabase/seed.sql`**.
5. Authentication → Users → **Add user** (email + password). Este será tu admin.
6. SQL Editor:
   ```sql
   update public.profiles
   set role = 'super_admin', full_name = 'Tu Nombre'
   where email = 'tu-correo@dominio.co';
   ```
7. Project Settings → API:
   - Copiar **Project URL**
   - Copiar **anon public**
   - Copiar **service_role** (no compartir nunca)

## 2. Repositorio (5 min)

```bash
git init
git add .
git commit -m "feat: bootstrap Pulso Colombia 2026"
git branch -M main
git remote add origin git@github.com:<tu-org>/pulso-colombia-2026.git
git push -u origin main
```

## 3. Vercel (10 min)

1. https://vercel.com → New Project → Import.
2. Framework: Next.js (auto).
3. Configurar **Environment Variables** (Production, Preview, Development):

   ```
   NEXT_PUBLIC_SUPABASE_URL=…
   NEXT_PUBLIC_SUPABASE_ANON_KEY=…
   SUPABASE_SERVICE_ROLE_KEY=…
   NEXT_PUBLIC_SITE_URL=https://<tu-dominio>
   NEXT_PUBLIC_SITE_NAME=Pulso Colombia 2026
   ADMIN_EMAIL=privacidad@tu-dominio.co
   ADMIN_PHONE=+57 300 000 0000
   ADMIN_ORG=Pulso Colombia 2026
   ADMIN_ADDRESS=Bogotá D.C., Colombia
   IP_HASH_SALT=<un-string-largo-aleatorio>
   AI_PROVIDER=mock
   ```

4. Deploy.

## 4. Posdespliegue (5 min)

1. Visita `https://<tu-dominio>/admin/login` y entra con el usuario que creaste.
2. Revisa `/admin/candidates` y ajusta nombres / colores / fotos.
3. Revisa `/admin/questions` y confirma textos.
4. Publica la política definitiva en `/admin/settings`.
5. Carga las encuestas externas que quieras mostrar en `/admin/external-polls`.
6. Comparte la home `https://<tu-dominio>/` y `/participar?ref=…` para empezar.

## 5. Cuando integres WhatsApp Business

- Pedir acceso a la app oficial de tu cliente Meta.
- Cargar `WHATSAPP_PROVIDER_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID` en Vercel.
- Implementar `sendTemplate` en `lib/whatsapp.ts`.
- Configurar webhook en Meta apuntando a `https://<tu-dominio>/api/whatsapp/webhook` (crear `app/api/whatsapp/webhook/route.ts` cuando llegues ahí).

## 6. Cuando integres IA real

- Cambiar `AI_PROVIDER=anthropic` (o `openai` / `gemini`) y cargar `AI_API_KEY`.
- Implementar provider en `lib/ai/advisor.ts` cumpliendo la interfaz `AiProvider`.
- **No relajar** las reglas: citar fuentes, no usar lenguaje directivo, decir “no tengo información verificada suficiente” cuando aplique.

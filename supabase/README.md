# Supabase — Pulso Colombia 2026

## Orden de ejecución

1. Crea proyecto en https://supabase.com/dashboard.
2. En **SQL Editor** → New query → pega y ejecuta `migrations/0001_init.sql`.
3. Pega y ejecuta `seed.sql`.
4. Crea un usuario administrador en **Authentication → Users → Add user** (email + password).
5. En SQL Editor, eleva su rol:
   ```sql
   update public.profiles
   set role = 'super_admin', full_name = 'Tu Nombre'
   where email = 'tu-correo@dominio.co';
   ```
6. Copia **Project URL**, **anon key** y **service_role key** desde *Project Settings → API*.

## Notas

- Los inserts del flujo público (participantes y respuestas) los hace Next.js usando la **service role key** desde server actions. El cliente del navegador nunca tiene esa clave.
- Las vistas `v_public_*` están expuestas a `anon` y agregan los datos. Nunca exponen filas individuales.
- Si renombras o agregas departamentos/regiones, actualiza también `lib/constants.ts`.
- Para regenerar tipos TypeScript: `supabase gen types typescript --project-id <id> > lib/types/database.generated.ts`.

-- =====================================================================
-- Fix de advisors de seguridad post-init.
-- Ya aplicado al proyecto cypjagawpmoukvawqpwt vía MCP el 2026-04-25.
-- =====================================================================

-- 1. Vistas en SECURITY INVOKER (Postgres 15+). Antes corrían con permisos del
--    creador (security_definer), saltándose RLS de quien consulta. Ahora respetan
--    los permisos de la sesión que hace la query. Combinado con (2) y (3) se
--    garantiza que anon solo pueda leer columnas no-PII.
alter view public.v_public_results set (security_invoker = on);
alter view public.v_public_results_by_department set (security_invoker = on);
alter view public.v_public_summary set (security_invoker = on);
alter view public.v_participation_by_day set (security_invoker = on);

-- 2. Column-level GRANTs: anon solo puede SELECT estas columnas.
--    Nunca: full_name, whatsapp, age_range, gender, occupation, ip_hash, user_agent.
revoke select on public.participants from anon;
grant select (id, department, municipality, region, created_at)
  on public.participants to anon;

revoke select on public.survey_responses from anon;
grant select (id, completed, participant_id, created_at)
  on public.survey_responses to anon;

revoke select on public.survey_answers from anon;
grant select (id, response_id, question_id, option_id)
  on public.survey_answers to anon;

-- 3. RLS para anon: permitir lectura de filas necesarias para agregaciones.
--    El blindaje real está en (2): aunque la fila se devuelva, las columnas PII
--    no son visibles para anon.
drop policy if exists participants_anon_aggregate on public.participants;
create policy participants_anon_aggregate on public.participants
  for select to anon using (true);

drop policy if exists responses_anon_aggregate on public.survey_responses;
create policy responses_anon_aggregate on public.survey_responses
  for select to anon using (completed = true);

drop policy if exists answers_anon_aggregate on public.survey_answers;
create policy answers_anon_aggregate on public.survey_answers
  for select to anon using (true);

-- 4. search_path explícito en funciones trigger.
create or replace function public.tg_set_updated_at() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end $$;

create or replace function public.tg_only_one_current_policy() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.is_current then
    update public.privacy_policy_versions
      set is_current = false
      where id <> new.id and is_current = true;
  end if;
  return new;
end $$;

-- =====================================================================
-- Vistas agregadas para mostrar cobertura territorial en el home público.
-- Aplicado vía MCP el 2026-04-25 al proyecto cypjagawpmoukvawqpwt.
-- =====================================================================

create or replace view public.v_participation_by_region as
select
  case when coalesce(region, '') = '' then 'Sin región informada' else region end as region,
  count(*)::bigint as total
from public.participants
group by 1
order by 2 desc, 1;

create or replace view public.v_participation_by_department as
select
  case when coalesce(department, '') = '' then 'Sin departamento informado' else department end as department,
  count(*)::bigint as total
from public.participants
group by 1
order by 2 desc, 1;

alter view public.v_participation_by_region set (security_invoker = on);
alter view public.v_participation_by_department set (security_invoker = on);

grant select on public.v_participation_by_region to anon, authenticated;
grant select on public.v_participation_by_department to anon, authenticated;

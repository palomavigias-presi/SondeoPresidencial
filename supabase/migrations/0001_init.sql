-- =====================================================================
-- Pulso Colombia 2026 — Esquema inicial Supabase
-- Idempotente: usa CREATE ... IF NOT EXISTS donde aplica.
-- Ejecutar en Supabase SQL Editor o via CLI: supabase db push.
-- =====================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- =====================================================================
-- ENUMS / TYPES
-- =====================================================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'admin_role') then
    create type admin_role as enum ('super_admin', 'campaign_manager', 'analyst', 'viewer');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'question_type') then
    create type question_type as enum ('single_choice', 'multiple_choice', 'text', 'scale');
  end if;
end $$;

-- =====================================================================
-- PROFILES (admin)  — 1:1 con auth.users
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role admin_role not null default 'viewer',
  created_at timestamptz not null default now()
);

-- =====================================================================
-- PARTICIPANTS
-- =====================================================================
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  whatsapp text not null unique,
  department text not null,
  municipality text not null,
  region text not null,
  age_range text,
  gender text,
  occupation text,
  referral_code text not null unique,
  referred_by uuid references public.participants(id) on delete set null,
  campaign_id uuid,
  source text,
  consent_personal_data boolean not null default false,
  consent_sensitive_political_data boolean not null default false,
  consent_whatsapp boolean not null default false,
  privacy_version text not null default 'v1.0-2026',
  ip_hash text,
  user_agent text,
  status text not null default 'registered',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists participants_department_idx on public.participants (department);
create index if not exists participants_region_idx on public.participants (region);
create index if not exists participants_referred_by_idx on public.participants (referred_by);
create index if not exists participants_status_idx on public.participants (status);
create index if not exists participants_created_at_idx on public.participants (created_at desc);

-- =====================================================================
-- CANDIDATES
-- =====================================================================
create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  party text,
  bio text,
  photo_url text,
  color text,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists candidates_active_order_idx on public.candidates (active, display_order);

create table if not exists public.candidate_proposals (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  topic text not null,
  proposal text not null,
  source_url text,
  source_name text,
  created_at timestamptz not null default now()
);
create index if not exists candidate_proposals_topic_idx on public.candidate_proposals (topic);
create index if not exists candidate_proposals_candidate_idx on public.candidate_proposals (candidate_id);

-- =====================================================================
-- SURVEY (questions, options, responses, answers)
-- =====================================================================
create table if not exists public.survey_questions (
  id uuid primary key default gen_random_uuid(),
  question_text text not null,
  question_type question_type not null default 'single_choice',
  is_sensitive boolean not null default false,
  required boolean not null default true,
  active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists survey_questions_active_order_idx on public.survey_questions (active, display_order);

create table if not exists public.survey_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.survey_questions(id) on delete cascade,
  option_text text not null,
  option_value text not null,
  candidate_id uuid references public.candidates(id) on delete set null,
  display_order integer not null default 0,
  active boolean not null default true
);
create index if not exists survey_options_question_idx on public.survey_options (question_id, display_order);

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  completed boolean not null default false,
  profile_summary jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists survey_responses_participant_idx on public.survey_responses (participant_id);
create index if not exists survey_responses_completed_idx on public.survey_responses (completed);
create index if not exists survey_responses_created_at_idx on public.survey_responses (created_at desc);

create table if not exists public.survey_answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.survey_responses(id) on delete cascade,
  question_id uuid not null references public.survey_questions(id) on delete cascade,
  option_id uuid references public.survey_options(id) on delete set null,
  answer_text text,
  created_at timestamptz not null default now()
);
create index if not exists survey_answers_response_idx on public.survey_answers (response_id);
create index if not exists survey_answers_question_option_idx on public.survey_answers (question_id, option_id);

-- =====================================================================
-- CAMPAIGNS / WHATSAPP
-- =====================================================================
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  channel text not null default 'whatsapp',
  status text not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_contacts (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete set null,
  full_name text not null,
  whatsapp text not null,
  department text,
  municipality text,
  region text,
  has_opt_in boolean not null default false,
  import_status text not null default 'pending',
  error_message text,
  created_at timestamptz not null default now()
);
create index if not exists campaign_contacts_campaign_idx on public.campaign_contacts (campaign_id);
create unique index if not exists campaign_contacts_unique_phone
  on public.campaign_contacts (campaign_id, whatsapp);

create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  body text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists public.message_logs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete set null,
  whatsapp text not null,
  template_id uuid references public.message_templates(id) on delete set null,
  status text not null default 'pending',
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists message_logs_campaign_idx on public.message_logs (campaign_id);
create index if not exists message_logs_status_idx on public.message_logs (status);

-- FK diferida: participants.campaign_id → campaigns.id
alter table public.participants
  drop constraint if exists participants_campaign_id_fkey;
alter table public.participants
  add constraint participants_campaign_id_fkey
  foreign key (campaign_id) references public.campaigns(id) on delete set null;

-- =====================================================================
-- REFERRALS / SHARES
-- =====================================================================
create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  parent_participant_id uuid not null references public.participants(id) on delete cascade,
  child_participant_id uuid not null references public.participants(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (parent_participant_id, child_participant_id)
);
create index if not exists referral_events_parent_idx on public.referral_events (parent_participant_id);

create table if not exists public.share_events (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.participants(id) on delete cascade,
  channel text not null default 'whatsapp',
  referral_code text not null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists share_events_participant_idx on public.share_events (participant_id);

-- =====================================================================
-- EXTERNAL POLLS
-- =====================================================================
create table if not exists public.external_polls (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  pollster text not null,
  publication_date date not null,
  source_url text not null,
  technical_sheet text,
  image_url text,
  notes text,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists external_polls_visible_idx on public.external_polls (visible, publication_date desc);

create table if not exists public.external_poll_results (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.external_polls(id) on delete cascade,
  candidate_name text not null,
  percentage numeric(5,2) not null check (percentage >= 0 and percentage <= 100),
  display_order integer not null default 0
);

-- =====================================================================
-- AUDIT / DELETION REQUESTS / PRIVACY
-- =====================================================================
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_logs_entity_idx on public.audit_logs (entity, entity_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

create table if not exists public.data_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.participants(id) on delete set null,
  whatsapp text not null,
  request_type text not null default 'delete',
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.privacy_policy_versions (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  content_md text not null,
  published_at timestamptz not null default now(),
  is_current boolean not null default false
);

-- =====================================================================
-- TRIGGERS
-- =====================================================================
create or replace function public.tg_set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_participants_updated on public.participants;
create trigger trg_participants_updated
  before update on public.participants
  for each row execute procedure public.tg_set_updated_at();

create or replace function public.tg_only_one_current_policy() returns trigger
language plpgsql as $$
begin
  if new.is_current then
    update public.privacy_policy_versions
      set is_current = false
      where id <> new.id and is_current = true;
  end if;
  return new;
end $$;

drop trigger if exists trg_privacy_one_current on public.privacy_policy_versions;
create trigger trg_privacy_one_current
  after insert or update on public.privacy_policy_versions
  for each row execute procedure public.tg_only_one_current_policy();

-- =====================================================================
-- VIEWS PÚBLICAS (agregadas)
-- =====================================================================

-- Resultados agregados por pregunta/opción (sólo respuestas completadas)
create or replace view public.v_public_results as
select
  q.id as question_id,
  q.question_text,
  o.id as option_id,
  o.option_text,
  o.candidate_id,
  count(a.id)::bigint as total
from public.survey_questions q
left join public.survey_options o on o.question_id = q.id and o.active = true
left join public.survey_answers a on a.option_id = o.id
left join public.survey_responses r on r.id = a.response_id and r.completed = true
where q.active = true
group by q.id, q.question_text, o.id, o.option_text, o.candidate_id
order by q.display_order, o.display_order;

-- Resultados agregados por departamento
create or replace view public.v_public_results_by_department as
select
  p.department,
  q.id as question_id,
  o.id as option_id,
  count(a.id)::bigint as total
from public.survey_answers a
join public.survey_responses r on r.id = a.response_id and r.completed = true
join public.participants p on p.id = r.participant_id
join public.survey_questions q on q.id = a.question_id and q.active = true
join public.survey_options o on o.id = a.option_id and o.active = true
group by p.department, q.id, o.id;

-- Resumen general
create or replace view public.v_public_summary as
select
  (select count(*) from public.participants) as total_participants,
  (select count(*) from public.survey_responses where completed = true) as total_responses_completed,
  (select count(*) from public.survey_responses where completed = false) as total_responses_partial,
  (select count(distinct department) from public.participants) as total_departments,
  (select count(distinct municipality) from public.participants) as total_municipalities;

-- Participación por día (últimos 60 días)
create or replace view public.v_participation_by_day as
select
  date_trunc('day', created_at)::date as day,
  count(*)::bigint as total
from public.participants
where created_at > now() - interval '60 days'
group by 1
order by 1;

-- =====================================================================
-- FUNCIONES PÚBLICAS (RPC)
-- =====================================================================

-- Registrar evento de share. La policy permite a cualquiera insertar siempre que
-- el participant_id y referral_code coincidan (validado en RPC).
create or replace function public.rpc_register_share(
  p_participant_id uuid,
  p_channel text,
  p_referral_code text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not exists (select 1 from public.participants where id = p_participant_id and referral_code = p_referral_code) then
    raise exception 'invalid_share';
  end if;
  insert into public.share_events (participant_id, channel, referral_code)
    values (p_participant_id, p_channel, p_referral_code)
    returning id into v_id;
  return v_id;
end $$;

revoke all on function public.rpc_register_share(uuid, text, text) from public;
grant execute on function public.rpc_register_share(uuid, text, text) to anon, authenticated;

-- Solicitud de eliminación pública (sin login)
create or replace function public.rpc_request_deletion(
  p_whatsapp text,
  p_request_type text default 'delete',
  p_notes text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_participant uuid;
  v_id uuid;
begin
  select id into v_participant from public.participants where whatsapp = p_whatsapp limit 1;
  insert into public.data_deletion_requests (participant_id, whatsapp, request_type, notes)
    values (v_participant, p_whatsapp, coalesce(p_request_type, 'delete'), p_notes)
    returning id into v_id;
  return v_id;
end $$;

revoke all on function public.rpc_request_deletion(text, text, text) from public;
grant execute on function public.rpc_request_deletion(text, text, text) to anon, authenticated;

-- Helper: rol del usuario autenticado (uso en políticas)
create or replace function public.current_admin_role() returns admin_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;
grant execute on function public.current_admin_role() to authenticated;

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.participants enable row level security;
alter table public.candidates enable row level security;
alter table public.candidate_proposals enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_options enable row level security;
alter table public.survey_responses enable row level security;
alter table public.survey_answers enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_contacts enable row level security;
alter table public.message_templates enable row level security;
alter table public.message_logs enable row level security;
alter table public.referral_events enable row level security;
alter table public.share_events enable row level security;
alter table public.external_polls enable row level security;
alter table public.external_poll_results enable row level security;
alter table public.audit_logs enable row level security;
alter table public.data_deletion_requests enable row level security;
alter table public.privacy_policy_versions enable row level security;

-- ----- profiles -----
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (auth.uid() = id or public.current_admin_role() = 'super_admin');

drop policy if exists profiles_super_admin_write on public.profiles;
create policy profiles_super_admin_write on public.profiles
  for all using (public.current_admin_role() = 'super_admin')
  with check (public.current_admin_role() = 'super_admin');

-- ----- candidates / candidate_proposals: lectura pública, escritura admin -----
drop policy if exists candidates_public_read on public.candidates;
create policy candidates_public_read on public.candidates
  for select using (active = true or auth.role() = 'authenticated');

drop policy if exists candidates_admin_write on public.candidates;
create policy candidates_admin_write on public.candidates
  for all using (public.current_admin_role() in ('super_admin','campaign_manager'))
  with check (public.current_admin_role() in ('super_admin','campaign_manager'));

drop policy if exists proposals_public_read on public.candidate_proposals;
create policy proposals_public_read on public.candidate_proposals
  for select using (true);

drop policy if exists proposals_admin_write on public.candidate_proposals;
create policy proposals_admin_write on public.candidate_proposals
  for all using (public.current_admin_role() in ('super_admin','campaign_manager'))
  with check (public.current_admin_role() in ('super_admin','campaign_manager'));

-- ----- survey_questions / survey_options: lectura pública (activas), escritura admin -----
drop policy if exists questions_public_read on public.survey_questions;
create policy questions_public_read on public.survey_questions
  for select using (active = true or auth.role() = 'authenticated');

drop policy if exists questions_admin_write on public.survey_questions;
create policy questions_admin_write on public.survey_questions
  for all using (public.current_admin_role() in ('super_admin','campaign_manager'))
  with check (public.current_admin_role() in ('super_admin','campaign_manager'));

drop policy if exists options_public_read on public.survey_options;
create policy options_public_read on public.survey_options
  for select using (active = true or auth.role() = 'authenticated');

drop policy if exists options_admin_write on public.survey_options;
create policy options_admin_write on public.survey_options
  for all using (public.current_admin_role() in ('super_admin','campaign_manager'))
  with check (public.current_admin_role() in ('super_admin','campaign_manager'));

-- ----- participants: NUNCA lectura pública. Inserts via service role (server actions). -----
drop policy if exists participants_admin_read on public.participants;
create policy participants_admin_read on public.participants
  for select using (public.current_admin_role() is not null);

drop policy if exists participants_admin_write on public.participants;
create policy participants_admin_write on public.participants
  for all using (public.current_admin_role() in ('super_admin','campaign_manager'))
  with check (public.current_admin_role() in ('super_admin','campaign_manager'));

-- ----- survey_responses / survey_answers: lectura admin, escritura via service role -----
drop policy if exists responses_admin_read on public.survey_responses;
create policy responses_admin_read on public.survey_responses
  for select using (public.current_admin_role() is not null);

drop policy if exists answers_admin_read on public.survey_answers;
create policy answers_admin_read on public.survey_answers
  for select using (public.current_admin_role() is not null);

-- ----- campaigns / contacts / templates / logs: solo admin -----
drop policy if exists campaigns_admin on public.campaigns;
create policy campaigns_admin on public.campaigns
  for all using (public.current_admin_role() in ('super_admin','campaign_manager'))
  with check (public.current_admin_role() in ('super_admin','campaign_manager'));

drop policy if exists campaigns_read_all on public.campaigns;
create policy campaigns_read_all on public.campaigns
  for select using (public.current_admin_role() is not null);

drop policy if exists campaign_contacts_admin on public.campaign_contacts;
create policy campaign_contacts_admin on public.campaign_contacts
  for all using (public.current_admin_role() in ('super_admin','campaign_manager'))
  with check (public.current_admin_role() in ('super_admin','campaign_manager'));

drop policy if exists templates_admin on public.message_templates;
create policy templates_admin on public.message_templates
  for all using (public.current_admin_role() in ('super_admin','campaign_manager'))
  with check (public.current_admin_role() in ('super_admin','campaign_manager'));

drop policy if exists logs_admin on public.message_logs;
create policy logs_admin on public.message_logs
  for all using (public.current_admin_role() in ('super_admin','campaign_manager'))
  with check (public.current_admin_role() in ('super_admin','campaign_manager'));

-- ----- referral / share events: lectura admin -----
drop policy if exists referral_admin on public.referral_events;
create policy referral_admin on public.referral_events
  for select using (public.current_admin_role() is not null);

drop policy if exists share_admin on public.share_events;
create policy share_admin on public.share_events
  for select using (public.current_admin_role() is not null);

-- ----- external_polls: lectura pública (visible=true), escritura admin -----
drop policy if exists polls_public_read on public.external_polls;
create policy polls_public_read on public.external_polls
  for select using (visible = true or auth.role() = 'authenticated');

drop policy if exists polls_admin_write on public.external_polls;
create policy polls_admin_write on public.external_polls
  for all using (public.current_admin_role() in ('super_admin','campaign_manager'))
  with check (public.current_admin_role() in ('super_admin','campaign_manager'));

drop policy if exists poll_results_public_read on public.external_poll_results;
create policy poll_results_public_read on public.external_poll_results
  for select using (true);

drop policy if exists poll_results_admin_write on public.external_poll_results;
create policy poll_results_admin_write on public.external_poll_results
  for all using (public.current_admin_role() in ('super_admin','campaign_manager'))
  with check (public.current_admin_role() in ('super_admin','campaign_manager'));

-- ----- audit / deletion / privacy -----
drop policy if exists audit_admin_read on public.audit_logs;
create policy audit_admin_read on public.audit_logs
  for select using (public.current_admin_role() is not null);

drop policy if exists deletion_admin_read on public.data_deletion_requests;
create policy deletion_admin_read on public.data_deletion_requests
  for select using (public.current_admin_role() is not null);

drop policy if exists deletion_admin_write on public.data_deletion_requests;
create policy deletion_admin_write on public.data_deletion_requests
  for update using (public.current_admin_role() in ('super_admin','campaign_manager'))
  with check (public.current_admin_role() in ('super_admin','campaign_manager'));

drop policy if exists privacy_public_read on public.privacy_policy_versions;
create policy privacy_public_read on public.privacy_policy_versions
  for select using (true);

drop policy if exists privacy_admin_write on public.privacy_policy_versions;
create policy privacy_admin_write on public.privacy_policy_versions
  for all using (public.current_admin_role() = 'super_admin')
  with check (public.current_admin_role() = 'super_admin');

-- =====================================================================
-- VIEW GRANTS (lectura pública controlada)
-- =====================================================================
grant select on public.v_public_results to anon, authenticated;
grant select on public.v_public_results_by_department to anon, authenticated;
grant select on public.v_public_summary to anon, authenticated;
grant select on public.v_participation_by_day to anon, authenticated;

-- =====================================================================
-- TRIGGER auth.users → profiles (creación automática como viewer)
-- =====================================================================
create or replace function public.handle_new_admin_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_admin_user();

-- =====================================================================
-- Índices sobre FKs que Postgres no auto-crea.
-- Aplicado vía MCP el 2026-04-25 al proyecto cypjagawpmoukvawqpwt.
-- =====================================================================
create index if not exists audit_logs_actor_id_idx
  on public.audit_logs (actor_id);
create index if not exists campaign_contacts_participant_id_idx
  on public.campaign_contacts (participant_id);
create index if not exists campaigns_created_by_idx
  on public.campaigns (created_by);
create index if not exists data_deletion_requests_participant_id_idx
  on public.data_deletion_requests (participant_id);
create index if not exists external_poll_results_poll_id_idx
  on public.external_poll_results (poll_id);
create index if not exists message_logs_participant_id_idx
  on public.message_logs (participant_id);
create index if not exists message_logs_template_id_idx
  on public.message_logs (template_id);
create index if not exists message_templates_campaign_id_idx
  on public.message_templates (campaign_id);
create index if not exists referral_events_child_idx
  on public.referral_events (child_participant_id);
create index if not exists referral_events_campaign_idx
  on public.referral_events (campaign_id);
create index if not exists share_events_campaign_idx
  on public.share_events (campaign_id);
create index if not exists survey_options_candidate_id_idx
  on public.survey_options (candidate_id);
create index if not exists survey_answers_question_id_idx
  on public.survey_answers (question_id);
create index if not exists participants_campaign_id_idx
  on public.participants (campaign_id);

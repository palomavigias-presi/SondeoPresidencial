-- =====================================================================
-- Pulso Colombia 2026 — Seed inicial
-- Idempotente: usa ON CONFLICT DO NOTHING en claves únicas.
-- Ejecutar en Supabase SQL Editor después de 0001_init.sql
-- =====================================================================

-- ===== Política de privacidad inicial =====
insert into public.privacy_policy_versions (version, content_md, is_current)
values (
  'v1.0-2026',
  E'# Política de tratamiento de datos\n\n_Versión inicial. Edita el contenido desde el panel admin para reflejar los datos reales del responsable._\n',
  true
)
on conflict (version) do nothing;

-- ===== Candidatos (editables desde admin) =====
insert into public.candidates (name, party, color, active, display_order)
values
  ('Paloma Valencia',          'Centro Democrático',           '#1F5BB8', true, 1),
  ('Abelardo de la Espriella', 'Movimiento independiente',     '#7E2D8E', true, 2),
  ('Sergio Fajardo',           'Coalición Centro Esperanza',   '#0E9E6A', true, 3),
  ('Claudia López',            'Alianza Verde',                '#2BB673', true, 4),
  ('Iván Cepeda',              'Pacto Histórico',              '#C0182B', true, 5),
  ('Otro candidato',           null,                           '#6B7280', true, 90),
  ('Voto en blanco',           null,                           '#9CA3AF', true, 91),
  ('Todavía no he decidido',   null,                           '#CBD5E1', true, 92),
  ('Prefiero no responder',    null,                           '#E5E7EB', true, 93)
on conflict do nothing;

-- ===== Preguntas =====
insert into public.survey_questions (question_text, question_type, is_sensitive, required, active, display_order)
values
  ('Si la primera vuelta presidencial fuera hoy, ¿por quién votaría?', 'single_choice', true,  true, true, 1),
  ('¿Qué tema será más importante para decidir su voto?',              'single_choice', false, true, true, 2),
  ('¿Qué tan convencido está de su decisión?',                         'single_choice', false, true, true, 3),
  ('¿Con cuál tendencia se identifica más?',                           'single_choice', true,  true, true, 4),
  ('¿Qué busca principalmente en un presidente?',                      'single_choice', false, true, true, 5),
  ('¿Autoriza que le enviemos información comparativa de propuestas por WhatsApp?', 'single_choice', false, true, true, 6)
on conflict do nothing;

-- ===== Opciones — bloque manejable por SQL plano =====
do $$
declare
  q1 uuid; q2 uuid; q3 uuid; q4 uuid; q5 uuid; q6 uuid;
begin
  select id into q1 from public.survey_questions where display_order = 1 limit 1;
  select id into q2 from public.survey_questions where display_order = 2 limit 1;
  select id into q3 from public.survey_questions where display_order = 3 limit 1;
  select id into q4 from public.survey_questions where display_order = 4 limit 1;
  select id into q5 from public.survey_questions where display_order = 5 limit 1;
  select id into q6 from public.survey_questions where display_order = 6 limit 1;

  -- Q1 — opciones vinculadas a candidatos
  insert into public.survey_options (question_id, option_text, option_value, candidate_id, display_order)
  select q1, c.name, lower(replace(c.name, ' ', '_')), c.id, c.display_order
  from public.candidates c
  where c.active
  on conflict do nothing;

  -- Q2
  insert into public.survey_options (question_id, option_text, option_value, display_order) values
    (q2, 'Seguridad', 'seguridad', 1),
    (q2, 'Economía y empleo', 'economia', 2),
    (q2, 'Corrupción', 'corrupcion', 3),
    (q2, 'Salud', 'salud', 4),
    (q2, 'Educación', 'educacion', 5),
    (q2, 'Costo de vida', 'costo_vida', 6),
    (q2, 'Paz y orden público', 'paz', 7),
    (q2, 'Medio ambiente', 'medio_ambiente', 8),
    (q2, 'Otro', 'otro', 9)
  on conflict do nothing;

  -- Q3
  insert into public.survey_options (question_id, option_text, option_value, display_order) values
    (q3, 'Muy convencido, no cambiaría mi voto', 'firme', 1),
    (q3, 'Bastante convencido, pero escucho argumentos', 'persuadible', 2),
    (q3, 'Aún tengo dudas', 'dudoso', 3),
    (q3, 'Estoy totalmente indeciso', 'indeciso', 4)
  on conflict do nothing;

  -- Q4
  insert into public.survey_options (question_id, option_text, option_value, display_order) values
    (q4, 'Derecha', 'derecha', 1),
    (q4, 'Centro derecha', 'centro_derecha', 2),
    (q4, 'Centro', 'centro', 3),
    (q4, 'Centro izquierda', 'centro_izquierda', 4),
    (q4, 'Izquierda', 'izquierda', 5),
    (q4, 'Independiente / ninguna', 'independiente', 6),
    (q4, 'Prefiero no responder', 'no_responde', 7)
  on conflict do nothing;

  -- Q5
  insert into public.survey_options (question_id, option_text, option_value, display_order) values
    (q5, 'Autoridad y seguridad', 'autoridad', 1),
    (q5, 'Experiencia técnica', 'experiencia', 2),
    (q5, 'Renovación política', 'renovacion', 3),
    (q5, 'Defensa de libertades', 'libertades', 4),
    (q5, 'Justicia social', 'justicia_social', 5),
    (q5, 'Estabilidad económica', 'estabilidad', 6),
    (q5, 'Unidad nacional', 'unidad', 7),
    (q5, 'Mano firme contra la corrupción', 'anticorrupcion', 8)
  on conflict do nothing;

  -- Q6
  insert into public.survey_options (question_id, option_text, option_value, display_order) values
    (q6, 'Sí', 'si', 1),
    (q6, 'No', 'no', 2)
  on conflict do nothing;
end $$;

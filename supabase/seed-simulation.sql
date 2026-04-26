-- =====================================================================
-- SIMULACIÓN: 54,532 participantes con source='simulated'
-- Aplicado vía MCP el 2026-04-25.
--
-- Distribución de Q1 ≈ Valora Analitik (referencia visual del usuario):
--   Cepeda 35.5 · Abelardo 20.9 · Paloma 18.7 · Sergio 4.5 · Claudia 2.9
--   + Otro 6.0 · Blanco 4.0 · Indeciso 5.0 · NR 2.5
--
-- Distribución territorial: pesos por departamento aproximando población,
-- con 12% sin departamento informado.
--
-- IDEMPOTENTE: borra simulados previos antes de insertar.
-- Para limpiar todos los simulados sin re-generar:
--   DELETE FROM survey_answers WHERE response_id IN (
--     SELECT r.id FROM survey_responses r
--     JOIN participants p ON p.id = r.participant_id
--     WHERE p.source = 'simulated'
--   );
--   DELETE FROM survey_responses WHERE participant_id IN (
--     SELECT id FROM participants WHERE source = 'simulated'
--   );
--   DELETE FROM participants WHERE source = 'simulated';
-- =====================================================================

DO $$
DECLARE
  q1_id UUID; q2_id UUID; q3_id UUID; q4_id UUID; q5_id UUID; q6_id UUID;
  o_cepeda UUID; o_abelardo UUID; o_paloma UUID; o_sergio UUID; o_claudia UUID;
  o_otro UUID; o_blanco UUID; o_indeciso UUID; o_nr UUID;
  o_q6_si UUID; o_q6_no UUID;
  q2_arr UUID[]; q3_arr UUID[]; q4_arr UUID[]; q5_arr UUID[];
BEGIN
  -- 1) Cargar IDs de preguntas/opciones/candidatos
  SELECT id INTO q1_id FROM public.survey_questions WHERE display_order = 1;
  SELECT id INTO q2_id FROM public.survey_questions WHERE display_order = 2;
  SELECT id INTO q3_id FROM public.survey_questions WHERE display_order = 3;
  SELECT id INTO q4_id FROM public.survey_questions WHERE display_order = 4;
  SELECT id INTO q5_id FROM public.survey_questions WHERE display_order = 5;
  SELECT id INTO q6_id FROM public.survey_questions WHERE display_order = 6;

  SELECT o.id INTO o_cepeda FROM public.survey_options o JOIN public.candidates c ON c.id = o.candidate_id WHERE o.question_id = q1_id AND c.name = 'Iván Cepeda';
  SELECT o.id INTO o_abelardo FROM public.survey_options o JOIN public.candidates c ON c.id = o.candidate_id WHERE o.question_id = q1_id AND c.name = 'Abelardo de la Espriella';
  SELECT o.id INTO o_paloma FROM public.survey_options o JOIN public.candidates c ON c.id = o.candidate_id WHERE o.question_id = q1_id AND c.name = 'Paloma Valencia';
  SELECT o.id INTO o_sergio FROM public.survey_options o JOIN public.candidates c ON c.id = o.candidate_id WHERE o.question_id = q1_id AND c.name = 'Sergio Fajardo';
  SELECT o.id INTO o_claudia FROM public.survey_options o JOIN public.candidates c ON c.id = o.candidate_id WHERE o.question_id = q1_id AND c.name = 'Claudia López';
  SELECT o.id INTO o_otro FROM public.survey_options o JOIN public.candidates c ON c.id = o.candidate_id WHERE o.question_id = q1_id AND c.name = 'Otro candidato';
  SELECT o.id INTO o_blanco FROM public.survey_options o JOIN public.candidates c ON c.id = o.candidate_id WHERE o.question_id = q1_id AND c.name = 'Voto en blanco';
  SELECT o.id INTO o_indeciso FROM public.survey_options o JOIN public.candidates c ON c.id = o.candidate_id WHERE o.question_id = q1_id AND c.name = 'Todavía no he decidido';
  SELECT o.id INTO o_nr FROM public.survey_options o JOIN public.candidates c ON c.id = o.candidate_id WHERE o.question_id = q1_id AND c.name = 'Prefiero no responder';

  SELECT id INTO o_q6_si FROM public.survey_options WHERE question_id = q6_id AND option_value = 'si';
  SELECT id INTO o_q6_no FROM public.survey_options WHERE question_id = q6_id AND option_value = 'no';

  SELECT array_agg(id) INTO q2_arr FROM public.survey_options WHERE question_id = q2_id AND active;
  SELECT array_agg(id) INTO q3_arr FROM public.survey_options WHERE question_id = q3_id AND active;
  SELECT array_agg(id) INTO q4_arr FROM public.survey_options WHERE question_id = q4_id AND active;
  SELECT array_agg(id) INTO q5_arr FROM public.survey_options WHERE question_id = q5_id AND active;

  -- 2) Limpieza idempotente
  DELETE FROM public.survey_answers WHERE response_id IN (
    SELECT r.id FROM public.survey_responses r
    JOIN public.participants p ON p.id = r.participant_id
    WHERE p.source = 'simulated'
  );
  DELETE FROM public.survey_responses WHERE participant_id IN (
    SELECT id FROM public.participants WHERE source = 'simulated'
  );
  DELETE FROM public.referral_events
    WHERE parent_participant_id IN (SELECT id FROM public.participants WHERE source = 'simulated')
       OR child_participant_id IN (SELECT id FROM public.participants WHERE source = 'simulated');
  DELETE FROM public.share_events
    WHERE participant_id IN (SELECT id FROM public.participants WHERE source = 'simulated');
  DELETE FROM public.participants WHERE source = 'simulated';

  -- 3) Generar tickets en temp table
  CREATE TEMP TABLE sim_tickets ON COMMIT DROP AS
  WITH gen AS (
    SELECT
      i,
      gen_random_uuid() AS participant_id,
      gen_random_uuid() AS response_id,
      'SIM' || lpad(i::text, 6, '0') AS referral_code,
      random() AS r_dept_skip, random() AS r_dept_pick,
      random() AS r_age_skip,  random() AS r_age_pick,
      random() AS r_gen_skip,  random() AS r_gen_pick,
      random() AS r_q1, random() AS r_q2, random() AS r_q3,
      random() AS r_q4, random() AS r_q5, random() AS r_q6,
      random() AS r_days
    FROM generate_series(1, 54532) AS s(i)
  ),
  with_dept AS (
    SELECT *,
      CASE WHEN r_dept_skip < 0.12 THEN ''
           ELSE COALESCE((
             ARRAY[
               'Bogotá D.C.','Bogotá D.C.','Bogotá D.C.','Bogotá D.C.','Bogotá D.C.','Bogotá D.C.','Bogotá D.C.','Bogotá D.C.','Bogotá D.C.','Bogotá D.C.','Bogotá D.C.','Bogotá D.C.','Bogotá D.C.','Bogotá D.C.','Bogotá D.C.','Bogotá D.C.',
               'Antioquia','Antioquia','Antioquia','Antioquia','Antioquia','Antioquia','Antioquia','Antioquia','Antioquia','Antioquia','Antioquia','Antioquia','Antioquia',
               'Valle del Cauca','Valle del Cauca','Valle del Cauca','Valle del Cauca','Valle del Cauca','Valle del Cauca','Valle del Cauca','Valle del Cauca','Valle del Cauca',
               'Cundinamarca','Cundinamarca','Cundinamarca','Cundinamarca','Cundinamarca','Cundinamarca',
               'Atlántico','Atlántico','Atlántico','Atlántico','Atlántico',
               'Santander','Santander','Santander','Santander',
               'Bolívar','Bolívar','Bolívar','Bolívar',
               'Córdoba','Córdoba','Córdoba',
               'Norte de Santander','Norte de Santander','Norte de Santander',
               'Nariño','Nariño','Nariño',
               'Tolima','Tolima','Tolima',
               'Cauca','Cauca','Cauca',
               'Magdalena','Magdalena','Magdalena',
               'Boyacá','Boyacá','Boyacá',
               'Huila','Huila',
               'Cesar','Cesar',
               'Meta','Meta',
               'Caldas','Caldas',
               'Risaralda','Risaralda',
               'La Guajira','La Guajira',
               'Sucre','Quindío','Putumayo','Caquetá','Casanare','Chocó','Arauca','Amazonas','San Andrés y Providencia','Vichada','Guaviare','Vaupés','Guainía'
             ]::TEXT[]
           )[1 + floor(r_dept_pick * 103)::int], '')
      END AS department
    FROM gen
  )
  SELECT
    i, participant_id, response_id, referral_code, department,
    CASE department
      WHEN '' THEN ''
      WHEN 'Bogotá D.C.' THEN 'Bogotá D.C.' WHEN 'Antioquia' THEN 'Medellín'
      WHEN 'Valle del Cauca' THEN 'Cali' WHEN 'Cundinamarca' THEN 'Soacha'
      WHEN 'Atlántico' THEN 'Barranquilla' WHEN 'Santander' THEN 'Bucaramanga'
      WHEN 'Bolívar' THEN 'Cartagena' WHEN 'Córdoba' THEN 'Montería'
      WHEN 'Norte de Santander' THEN 'Cúcuta' WHEN 'Nariño' THEN 'Pasto'
      WHEN 'Tolima' THEN 'Ibagué' WHEN 'Cauca' THEN 'Popayán'
      WHEN 'Magdalena' THEN 'Santa Marta' WHEN 'Boyacá' THEN 'Tunja'
      WHEN 'Huila' THEN 'Neiva' WHEN 'Cesar' THEN 'Valledupar'
      WHEN 'Meta' THEN 'Villavicencio' WHEN 'Caldas' THEN 'Manizales'
      WHEN 'Risaralda' THEN 'Pereira' WHEN 'La Guajira' THEN 'Riohacha'
      WHEN 'Sucre' THEN 'Sincelejo' WHEN 'Quindío' THEN 'Armenia'
      WHEN 'Putumayo' THEN 'Mocoa' WHEN 'Caquetá' THEN 'Florencia'
      WHEN 'Casanare' THEN 'Yopal' WHEN 'Chocó' THEN 'Quibdó'
      WHEN 'Arauca' THEN 'Arauca' WHEN 'Amazonas' THEN 'Leticia'
      WHEN 'San Andrés y Providencia' THEN 'San Andrés'
      WHEN 'Vichada' THEN 'Puerto Carreño'
      WHEN 'Guaviare' THEN 'San José del Guaviare'
      WHEN 'Vaupés' THEN 'Mitú' WHEN 'Guainía' THEN 'Inírida'
      ELSE ''
    END AS municipality,
    CASE department
      WHEN '' THEN ''
      WHEN 'Bogotá D.C.' THEN 'Bogotá D.C.'
      WHEN 'Antioquia' THEN 'Andina' WHEN 'Cundinamarca' THEN 'Andina'
      WHEN 'Santander' THEN 'Andina' WHEN 'Norte de Santander' THEN 'Andina'
      WHEN 'Tolima' THEN 'Andina' WHEN 'Boyacá' THEN 'Andina'
      WHEN 'Huila' THEN 'Andina' WHEN 'Caldas' THEN 'Andina'
      WHEN 'Risaralda' THEN 'Andina' WHEN 'Quindío' THEN 'Andina'
      WHEN 'Atlántico' THEN 'Caribe' WHEN 'Bolívar' THEN 'Caribe'
      WHEN 'Córdoba' THEN 'Caribe' WHEN 'Magdalena' THEN 'Caribe'
      WHEN 'Cesar' THEN 'Caribe' WHEN 'La Guajira' THEN 'Caribe'
      WHEN 'Sucre' THEN 'Caribe'
      WHEN 'Valle del Cauca' THEN 'Pacífica' WHEN 'Nariño' THEN 'Pacífica'
      WHEN 'Cauca' THEN 'Pacífica' WHEN 'Chocó' THEN 'Pacífica'
      WHEN 'Meta' THEN 'Orinoquía' WHEN 'Casanare' THEN 'Orinoquía'
      WHEN 'Arauca' THEN 'Orinoquía' WHEN 'Vichada' THEN 'Orinoquía'
      WHEN 'Putumayo' THEN 'Amazonía' WHEN 'Caquetá' THEN 'Amazonía'
      WHEN 'Amazonas' THEN 'Amazonía' WHEN 'Guaviare' THEN 'Amazonía'
      WHEN 'Vaupés' THEN 'Amazonía' WHEN 'Guainía' THEN 'Amazonía'
      WHEN 'San Andrés y Providencia' THEN 'Insular'
      ELSE ''
    END AS region,
    CASE WHEN r_age_skip < 0.28 THEN NULL
      ELSE (ARRAY['18-24','18-24','18-24','25-34','25-34','25-34','25-34','25-34','35-44','35-44','35-44','35-44','45-54','45-54','45-54','55-64','55-64','65+'])[1 + floor(r_age_pick * 18)::int]
    END AS age_range,
    CASE WHEN r_gen_skip < 0.25 THEN NULL
      WHEN r_gen_pick < 0.48 THEN 'Femenino'
      WHEN r_gen_pick < 0.96 THEN 'Masculino'
      WHEN r_gen_pick < 0.97 THEN 'No binario'
      ELSE 'Prefiero no responder'
    END AS gender,
    CASE
      WHEN r_q1 < 0.355 THEN o_cepeda
      WHEN r_q1 < 0.564 THEN o_abelardo
      WHEN r_q1 < 0.751 THEN o_paloma
      WHEN r_q1 < 0.796 THEN o_sergio
      WHEN r_q1 < 0.825 THEN o_claudia
      WHEN r_q1 < 0.885 THEN o_otro
      WHEN r_q1 < 0.925 THEN o_blanco
      WHEN r_q1 < 0.975 THEN o_indeciso
      ELSE o_nr
    END AS q1_option,
    q2_arr[1 + floor(r_q2 * array_length(q2_arr, 1))::int] AS q2_option,
    q3_arr[1 + floor(r_q3 * array_length(q3_arr, 1))::int] AS q3_option,
    q4_arr[1 + floor(r_q4 * array_length(q4_arr, 1))::int] AS q4_option,
    q5_arr[1 + floor(r_q5 * array_length(q5_arr, 1))::int] AS q5_option,
    CASE WHEN r_q6 < 0.40 THEN o_q6_si ELSE o_q6_no END AS q6_option,
    now() - (r_days * interval '45 days') AS created_at
  FROM with_dept;

  -- 4) Insert participantes simulados
  INSERT INTO public.participants (
    id, full_name, whatsapp, department, municipality, region,
    age_range, gender, occupation, referral_code,
    consent_personal_data, consent_sensitive_political_data, consent_whatsapp,
    privacy_version, source, status, created_at, updated_at
  )
  SELECT
    t.participant_id,
    'Simulado #' || lpad(t.i::text, 6, '0'),
    'sim:' || lpad(t.i::text, 6, '0'),
    t.department, t.municipality, t.region,
    t.age_range, t.gender, NULL,
    t.referral_code,
    false, false, false,
    'simulated', 'simulated', 'responded',
    t.created_at, t.created_at
  FROM sim_tickets t;

  -- 5) Insert respuestas
  INSERT INTO public.survey_responses (id, participant_id, completed, completed_at, created_at)
  SELECT t.response_id, t.participant_id, true, t.created_at, t.created_at
  FROM sim_tickets t;

  -- 6) Insert answers (6 por ticket)
  INSERT INTO public.survey_answers (response_id, question_id, option_id, created_at)
  SELECT response_id, q1_id, q1_option, created_at FROM sim_tickets WHERE q1_option IS NOT NULL
  UNION ALL SELECT response_id, q2_id, q2_option, created_at FROM sim_tickets WHERE q2_option IS NOT NULL
  UNION ALL SELECT response_id, q3_id, q3_option, created_at FROM sim_tickets WHERE q3_option IS NOT NULL
  UNION ALL SELECT response_id, q4_id, q4_option, created_at FROM sim_tickets WHERE q4_option IS NOT NULL
  UNION ALL SELECT response_id, q5_id, q5_option, created_at FROM sim_tickets WHERE q5_option IS NOT NULL
  UNION ALL SELECT response_id, q6_id, q6_option, created_at FROM sim_tickets WHERE q6_option IS NOT NULL;
END $$;

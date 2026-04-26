import { z } from "zod";

export const surveyAnswerSchema = z.object({
  question_id: z.string().uuid(),
  option_id: z.string().uuid().nullable().optional(),
  answer_text: z.string().max(1000).nullable().optional(),
});

export const surveySubmissionSchema = z.object({
  participant_id: z.string().uuid(),
  answers: z.array(surveyAnswerSchema).min(1, "Debes responder al menos una pregunta"),
});

export type SurveyAnswerInput = z.infer<typeof surveyAnswerSchema>;
export type SurveySubmissionInput = z.infer<typeof surveySubmissionSchema>;

export const candidateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  party: z.string().trim().max(120).nullable().optional(),
  bio: z.string().trim().max(2000).nullable().optional(),
  photo_url: z.string().url().nullable().optional().or(z.literal("")),
  color: z
    .string()
    .regex(/^#?[0-9a-fA-F]{6}$/)
    .nullable()
    .optional()
    .or(z.literal("")),
  active: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
});

export const questionSchema = z.object({
  question_text: z.string().trim().min(5).max(500),
  question_type: z.enum(["single_choice", "multiple_choice", "text", "scale"]),
  is_sensitive: z.boolean().default(false),
  required: z.boolean().default(true),
  active: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
});

export const optionSchema = z.object({
  question_id: z.string().uuid(),
  option_text: z.string().trim().min(1).max(200),
  option_value: z.string().trim().min(1).max(80),
  candidate_id: z.string().uuid().nullable().optional(),
  display_order: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const externalPollSchema = z.object({
  title: z.string().trim().min(2).max(200),
  pollster: z.string().trim().min(2).max(120),
  publication_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  source_url: z.string().url(),
  technical_sheet: z.string().trim().max(2000).nullable().optional(),
  image_url: z.string().url().nullable().optional().or(z.literal("")),
  notes: z.string().trim().max(2000).nullable().optional(),
  visible: z.boolean().default(true),
  results: z
    .array(
      z.object({
        candidate_name: z.string().trim().min(1).max(120),
        percentage: z.number().min(0).max(100),
      }),
    )
    .default([]),
});

export const campaignSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).nullable().optional(),
  channel: z.string().default("whatsapp"),
  status: z
    .enum(["draft", "ready", "sent", "paused", "finished"])
    .default("draft"),
});

export const messageTemplateSchema = z.object({
  campaign_id: z.string().uuid(),
  name: z.string().trim().min(2).max(120),
  body: z.string().trim().min(5).max(4000),
  status: z.string().default("draft"),
});

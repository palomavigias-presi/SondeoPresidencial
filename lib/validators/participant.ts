import { z } from "zod";
import { AGE_RANGES, GENDERS, REGIONS } from "@/lib/constants";
import { DEPARTMENTS } from "@/lib/colombia-geo";
import { normalizeWhatsApp } from "@/lib/utils";

export const whatsappSchema = z
  .string()
  .trim()
  .min(7, "Ingresa un número de WhatsApp válido")
  .refine((val) => normalizeWhatsApp(val) !== null, {
    message: "WhatsApp inválido. Usa 10 dígitos colombianos o formato +57XXXXXXXXXX.",
  });

// Esquema mínimo: solo nombre y WhatsApp son obligatorios.
// Los demás (departamento/municipio/región/edad/género/ocupación) son opcionales.
// Consentimiento de datos personales sigue siendo obligatorio.
export const participantSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(3, "Tu nombre debe tener al menos 3 caracteres")
      .max(120, "Nombre demasiado largo"),
    whatsapp: whatsappSchema,
    department: z
      .union([z.enum(DEPARTMENTS as [string, ...string[]]), z.literal("")])
      .optional(),
    municipality: z.string().trim().max(120).optional().or(z.literal("")),
    region: z.union([z.enum(REGIONS), z.literal("")]).optional(),
    age_range: z.enum(AGE_RANGES).optional().or(z.literal("")),
    gender: z.enum(GENDERS).optional().or(z.literal("")),
    occupation: z.string().trim().max(120).optional().or(z.literal("")),
    consent_personal_data: z.literal(true, {
      errorMap: () => ({
        message:
          "Debes autorizar el tratamiento de datos personales para participar.",
      }),
    }),
    consent_sensitive_political_data: z.boolean().default(false),
    consent_whatsapp: z.boolean().default(false),
    referral_code: z
      .string()
      .trim()
      .max(16)
      .regex(/^[A-Z0-9]*$/i, "Código de referido inválido")
      .optional()
      .or(z.literal("")),
  })
  .transform((v) => ({
    ...v,
    whatsapp: normalizeWhatsApp(v.whatsapp) ?? v.whatsapp,
    department: v.department || null,
    municipality: v.municipality || null,
    region: v.region || null,
    age_range: v.age_range || null,
    gender: v.gender || null,
    occupation: v.occupation || null,
    referral_code: v.referral_code ? v.referral_code.toUpperCase() : null,
  }));

export type ParticipantInput = z.input<typeof participantSchema>;
export type ParticipantParsed = z.output<typeof participantSchema>;

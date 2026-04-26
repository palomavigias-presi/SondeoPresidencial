export const SITE_NAME = "Pulso Colombia 2026";
export const SITE_TAGLINE =
  "Sondeo ciudadano transparente sobre la primera vuelta presidencial en Colombia";

export const PRIVACY_VERSION = "v1.0-2026";

export const REGIONS = [
  "Caribe",
  "Andina",
  "Pacífica",
  "Orinoquía",
  "Amazonía",
  "Bogotá D.C.",
  "Insular",
] as const;
export type Region = (typeof REGIONS)[number];

// Mapeo y catálogo geográfico viven en lib/colombia-geo.ts
export { DEPARTMENT_REGION, DEPARTMENTS, MUNICIPALITIES_BY_DEPARTMENT, getMunicipalities } from "./colombia-geo";

export const AGE_RANGES = [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
] as const;

export const GENDERS = [
  "Femenino",
  "Masculino",
  "No binario",
  "Prefiero no responder",
] as const;

export const ADMIN_ROLES = [
  "super_admin",
  "campaign_manager",
  "analyst",
  "viewer",
] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const PARTICIPANT_STATUSES = [
  "registered",
  "responded",
  "incomplete",
  "do_not_contact",
  "deletion_requested",
  "anonymized",
] as const;

export const CAMPAIGN_STATUSES = [
  "draft",
  "ready",
  "sent",
  "paused",
  "finished",
] as const;

export const MESSAGE_LOG_STATUSES = [
  "pending",
  "sent",
  "delivered",
  "read",
  "failed",
  "replied",
  "unsubscribed",
] as const;

export const QUESTION_TYPES = [
  "single_choice",
  "multiple_choice",
  "text",
  "scale",
] as const;

export const CONSENT_TEXT = `Autorizo el tratamiento de mis datos personales para participar en este sondeo ciudadano, recibir información relacionada si así lo autorizo y permitir el análisis estadístico agregado de los resultados. Entiendo que mis respuestas de opinión política pueden ser consideradas datos sensibles y que puedo solicitar la actualización, corrección o eliminación de mis datos.`;

export const TRANSPARENCY_DISCLAIMER = `Este sondeo recoge respuestas digitales voluntarias. Los resultados públicos se presentan de forma agregada y no revelan datos personales. Esta medición no reemplaza encuestas oficiales ni estudios probabilísticos registrados, salvo que se indique expresamente una ficha técnica que lo soporte.`;

export const WHATSAPP_SHARE_TEMPLATE = (link: string) =>
  `Hola, estoy participando en un sondeo ciudadano sobre la primera vuelta presidencial en Colombia. Responder toma menos de 2 minutos y puedes ver resultados agregados aquí: ${link}`;

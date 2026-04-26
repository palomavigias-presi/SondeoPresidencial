// Mapeo del nombre del departamento en el GeoJSON (NOMBRE_DPT, en mayúsculas
// y sin tildes) hacia el nombre canónico que usamos en la app y la base de datos.

export const GEOJSON_TO_DEPARTMENT: Record<string, string> = {
  AMAZONAS: "Amazonas",
  ANTIOQUIA: "Antioquia",
  ARAUCA: "Arauca",
  "ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA":
    "San Andrés y Providencia",
  ATLANTICO: "Atlántico",
  BOLIVAR: "Bolívar",
  BOYACA: "Boyacá",
  CALDAS: "Caldas",
  CAQUETA: "Caquetá",
  CASANARE: "Casanare",
  CAUCA: "Cauca",
  CESAR: "Cesar",
  CHOCO: "Chocó",
  CORDOBA: "Córdoba",
  CUNDINAMARCA: "Cundinamarca",
  GUAINIA: "Guainía",
  GUAVIARE: "Guaviare",
  HUILA: "Huila",
  "LA GUAJIRA": "La Guajira",
  MAGDALENA: "Magdalena",
  META: "Meta",
  NARIÑO: "Nariño",
  "NORTE DE SANTANDER": "Norte de Santander",
  PUTUMAYO: "Putumayo",
  QUINDIO: "Quindío",
  RISARALDA: "Risaralda",
  "SANTAFE DE BOGOTA D.C": "Bogotá D.C.",
  SANTANDER: "Santander",
  SUCRE: "Sucre",
  TOLIMA: "Tolima",
  "VALLE DEL CAUCA": "Valle del Cauca",
  VAUPES: "Vaupés",
  VICHADA: "Vichada",
};

export function normalizeGeoName(name: string | undefined): string | null {
  if (!name) return null;
  return GEOJSON_TO_DEPARTMENT[name.trim().toUpperCase()] ?? null;
}

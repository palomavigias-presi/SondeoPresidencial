// Departamentos y principales municipios de Colombia.
// Lista curada (capital + 8-15 municipios principales por departamento).
// Para producción puedes reemplazar este archivo por el catálogo oficial del DANE.

import type { Region } from "./constants";

export const DEPARTMENT_REGION: Record<string, Region> = {
  "Atlántico": "Caribe",
  "Bolívar": "Caribe",
  "Cesar": "Caribe",
  "Córdoba": "Caribe",
  "La Guajira": "Caribe",
  "Magdalena": "Caribe",
  "Sucre": "Caribe",
  "San Andrés y Providencia": "Insular",
  "Antioquia": "Andina",
  "Boyacá": "Andina",
  "Caldas": "Andina",
  "Cundinamarca": "Andina",
  "Huila": "Andina",
  "Norte de Santander": "Andina",
  "Quindío": "Andina",
  "Risaralda": "Andina",
  "Santander": "Andina",
  "Tolima": "Andina",
  "Bogotá D.C.": "Bogotá D.C.",
  "Cauca": "Pacífica",
  "Chocó": "Pacífica",
  "Nariño": "Pacífica",
  "Valle del Cauca": "Pacífica",
  "Arauca": "Orinoquía",
  "Casanare": "Orinoquía",
  "Meta": "Orinoquía",
  "Vichada": "Orinoquía",
  "Amazonas": "Amazonía",
  "Caquetá": "Amazonía",
  "Guainía": "Amazonía",
  "Guaviare": "Amazonía",
  "Putumayo": "Amazonía",
  "Vaupés": "Amazonía",
};

export const MUNICIPALITIES_BY_DEPARTMENT: Record<string, string[]> = {
  "Bogotá D.C.": ["Bogotá D.C."],
  "Antioquia": [
    "Medellín", "Bello", "Itagüí", "Envigado", "Apartadó", "Turbo", "Rionegro",
    "Sabaneta", "Caucasia", "Copacabana", "La Estrella", "Girardota", "Marinilla",
    "El Carmen de Viboral", "La Ceja", "Yarumal", "Caldas", "Andes",
  ],
  "Atlántico": [
    "Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Puerto Colombia",
    "Galapa", "Baranoa", "Sabanagrande", "Palmar de Varela", "Santo Tomás",
  ],
  "Bolívar": [
    "Cartagena", "Magangué", "Turbaco", "Arjona", "El Carmen de Bolívar",
    "Mompós", "San Pablo", "María la Baja", "San Juan Nepomuceno", "Santa Rosa del Sur",
  ],
  "Boyacá": [
    "Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa", "Villa de Leyva",
    "Puerto Boyacá", "Moniquirá", "Garagoa", "Samacá",
  ],
  "Caldas": [
    "Manizales", "La Dorada", "Chinchiná", "Villamaría", "Riosucio", "Anserma",
    "Aguadas", "Salamina", "Supía", "Pensilvania",
  ],
  "Caquetá": [
    "Florencia", "San Vicente del Caguán", "Puerto Rico", "El Doncello",
    "La Montañita", "Belén de los Andaquíes", "Cartagena del Chairá", "Albania",
  ],
  "Cauca": [
    "Popayán", "Santander de Quilichao", "Puerto Tejada", "Patía", "Caloto",
    "Piendamó", "Miranda", "Guapi", "Timbío", "Silvia",
  ],
  "Cesar": [
    "Valledupar", "Aguachica", "Bosconia", "Codazzi", "La Jagua de Ibirico",
    "Curumaní", "El Copey", "La Paz", "San Diego", "Chiriguaná",
  ],
  "Chocó": [
    "Quibdó", "Istmina", "Tadó", "Riosucio", "Condoto", "Bahía Solano",
    "Acandí", "Bojayá", "Nuquí", "Carmen del Darién",
  ],
  "Córdoba": [
    "Montería", "Lorica", "Cereté", "Sahagún", "Planeta Rica", "Tierralta",
    "Montelíbano", "Ciénaga de Oro", "Chinú", "San Antero",
  ],
  "Cundinamarca": [
    "Soacha", "Facatativá", "Zipaquirá", "Chía", "Mosquera", "Madrid",
    "Funza", "Cajicá", "Fusagasugá", "Girardot", "Ubaté", "La Calera",
    "Cota", "Tabio", "Tenjo",
  ],
  "Huila": [
    "Neiva", "Pitalito", "Garzón", "La Plata", "Campoalegre", "Aipe",
    "Gigante", "San Agustín", "Rivera", "Suaza",
  ],
  "La Guajira": [
    "Riohacha", "Maicao", "Uribia", "Manaure", "San Juan del Cesar",
    "Villanueva", "Fonseca", "Albania", "Dibulla", "Hatonuevo",
  ],
  "Magdalena": [
    "Santa Marta", "Ciénaga", "Fundación", "El Banco", "Plato", "Pivijay",
    "Aracataca", "Zona Bananera", "Sitionuevo", "Pueblo Viejo",
  ],
  "Meta": [
    "Villavicencio", "Acacías", "Granada", "Puerto López", "Puerto Gaitán",
    "San Martín", "Cumaral", "Restrepo", "El Castillo", "La Macarena",
  ],
  "Nariño": [
    "Pasto", "Ipiales", "Tumaco", "Túquerres", "La Unión", "Samaniego",
    "Sandoná", "Buesaco", "El Charco", "La Cruz",
  ],
  "Norte de Santander": [
    "Cúcuta", "Ocaña", "Pamplona", "Villa del Rosario", "Los Patios",
    "Tibú", "El Zulia", "Ábrego", "Sardinata", "Chinácota",
  ],
  "Putumayo": [
    "Mocoa", "Puerto Asís", "Orito", "Valle del Guamuez", "San Miguel",
    "Sibundoy", "Villagarzón", "Puerto Caicedo", "Puerto Leguízamo", "Colón",
  ],
  "Quindío": [
    "Armenia", "Calarcá", "La Tebaida", "Montenegro", "Quimbaya",
    "Circasia", "Salento", "Filandia", "Génova", "Pijao",
  ],
  "Risaralda": [
    "Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia",
    "Belén de Umbría", "Quinchía", "Marsella", "Apía", "Santuario", "Mistrató",
  ],
  "San Andrés y Providencia": ["San Andrés", "Providencia"],
  "Santander": [
    "Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja",
    "San Gil", "Socorro", "Málaga", "Vélez", "Lebrija", "Sabana de Torres",
  ],
  "Sucre": [
    "Sincelejo", "Corozal", "Sampués", "San Marcos", "Tolú", "Coveñas",
    "Los Palmitos", "Sincé", "Ovejas", "Galeras",
  ],
  "Tolima": [
    "Ibagué", "Espinal", "Melgar", "Chaparral", "Honda", "Líbano",
    "Mariquita", "Flandes", "Purificación", "Lérida", "Fresno",
  ],
  "Valle del Cauca": [
    "Cali", "Buenaventura", "Palmira", "Tuluá", "Cartago", "Buga",
    "Yumbo", "Jamundí", "Candelaria", "Florida", "Pradera", "Zarzal",
    "Sevilla", "Roldanillo", "Caicedonia",
  ],
  "Arauca": [
    "Arauca", "Saravena", "Tame", "Arauquita", "Fortul", "Puerto Rondón", "Cravo Norte",
  ],
  "Casanare": [
    "Yopal", "Aguazul", "Villanueva", "Tauramena", "Monterrey", "Paz de Ariporo",
    "Trinidad", "Maní", "Hato Corozal", "Pore",
  ],
  "Vichada": ["Puerto Carreño", "La Primavera", "Cumaribo", "Santa Rosalía"],
  "Amazonas": ["Leticia", "Puerto Nariño", "El Encanto", "La Chorrera"],
  "Guainía": ["Inírida", "Barranco Minas", "Mapiripana"],
  "Guaviare": ["San José del Guaviare", "Calamar", "El Retorno", "Miraflores"],
  "Vaupés": ["Mitú", "Carurú", "Taraira", "Pacoa"],
};

export const DEPARTMENTS = Object.keys(MUNICIPALITIES_BY_DEPARTMENT).sort((a, b) =>
  a.localeCompare(b, "es"),
);

export function getMunicipalities(department: string): string[] {
  return MUNICIPALITIES_BY_DEPARTMENT[department] ?? [];
}

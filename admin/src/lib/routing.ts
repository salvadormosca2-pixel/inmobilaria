/**
 * A quién se le deriva un lead caliente, por área + zona.
 *
 * Regla del negocio (ver mockData / módulo Equipo):
 *   Ventas · B° Norte · Piedra Blanca      → Lucas Agüero
 *   Ventas · Valle Viejo · Choya · Centro  → Nahuel Paz
 *   Alquileres (todas las zonas)           → Rocío Nieva
 *
 * El `chatwootId` es el user id del vendedor EN Chatwoot (el puente entre los dos
 * sistemas), y es lo que se usa para asignarle la conversación.
 */
export interface AgenteRuteo {
  nombre: string;
  area: "ventas" | "alquileres";
  chatwootId: number;
  zonas: string[];
}

export const AGENTES_RUTEO: AgenteRuteo[] = [
  { nombre: "Lucas Agüero", area: "ventas", chatwootId: 3, zonas: ["b norte", "barrio norte", "piedra blanca"] },
  { nombre: "Nahuel Paz", area: "ventas", chatwootId: 5, zonas: ["valle viejo", "choya", "centro"] },
  { nombre: "Rocío Nieva", area: "alquileres", chatwootId: 4, zonas: [] /* todas */ },
];

/** Normaliza para comparar zonas sin acentos, símbolos ni mayúsculas. */
const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // saca acentos
    .replace(/[^a-z0-9\s]/g, " ") // saca símbolos (°, ·, etc.)
    .replace(/\s+/g, " ")
    .trim();

/**
 * Elige el vendedor para un área + zona. Si la zona no matchea ninguna lista,
 * cae en el primer agente de esa área (así nunca queda sin dueño).
 */
export function elegirAgente(area: string, zona: string): AgenteRuteo | null {
  const a = norm(area);
  const z = norm(zona);
  const delArea = AGENTES_RUTEO.filter((ag) => ag.area === a);
  if (delArea.length === 0) return null;

  // Alquileres: uno solo, todas las zonas.
  if (a === "alquileres") return delArea[0];

  // Ventas: por zona.
  const porZona = delArea.find((ag) => ag.zonas.some((zz) => z.includes(zz) || zz.includes(z)));
  return porZona || delArea[0];
}

/**
 * Dominio Chatwoot: el tipo que devuelve la API, la lectura, y la clasificación
 * de cómo trabaja cada empleado.
 *
 * Este archivo es a propósito PURO (no importa datos de ningún lado) para que la
 * clasificación se pueda testear sola y no dependa de si los datos son mock o
 * reales.
 */

/* ============================ La conexión ============================ */

/**
 * Espejo EXACTO de la respuesta de:
 *   GET /api/v2/accounts/{account_id}/summary_reports/agent
 *   headers: { api_access_token: <account token> }
 *   query:   since, until  (timestamps Unix, en segundos)
 *            business_hours=true
 *
 * Los tiempos vienen en SEGUNDOS.
 *
 * business_hours=true NO es opcional para este caso: sin ese flag, las consultas
 * de la madrugada que contesta la IA entran al promedio del vendedor y lo dejan
 * como si tardara horas en responder. Medimos a la persona solo cuando estaba
 * trabajando.
 */
export interface ChatwootAgentReport {
  /** user id EN Chatwoot. No es el id nuestro: es el puente entre los dos sistemas. */
  id: number;
  conversations_count: number;
  resolved_conversations_count: number;
  avg_first_response_time: number | null;
  avg_reply_time: number | null;
  avg_resolution_time: number | null;
  /** Estos tres no vienen del summary endpoint sino del panel de reportes. */
  messages_sent: number;
  messages_received: number;
  trend_pct: number;
}

/**
 * Config de la instancia. El token SOLO puede vivir del lado del servidor: si se
 * lee desde un componente cliente, viaja en el bundle y queda expuesto. Por eso
 * la lectura pasa por /api/chatwoot/agents y no por el browser.
 */
export interface ChatwootConfig {
  baseUrl: string;
  accountId: number;
  accountToken: string;
}

export function leerConfig(): ChatwootConfig | null {
  const baseUrl = process.env.CHATWOOT_URL;
  const accountId = process.env.CHATWOOT_ACCOUNT_ID;
  const accountToken = process.env.CHATWOOT_ACCOUNT_TOKEN;
  if (!baseUrl || !accountId || !accountToken) return null;
  return { baseUrl, accountId: Number(accountId), accountToken };
}

/**
 * LA CONEXIÓN. Es el único lugar del sistema que habla con Chatwoot.
 * El día que exista la instancia, esto ya funciona: solo hay que definir las
 * env vars. Mientras tanto el route devuelve los datos de demo.
 */
export async function fetchAgentReports(
  cfg: ChatwootConfig,
  desde: Date,
  hasta: Date
): Promise<ChatwootAgentReport[]> {
  const url = new URL(`/api/v2/accounts/${cfg.accountId}/summary_reports/agent`, cfg.baseUrl);
  url.searchParams.set("since", String(Math.floor(desde.getTime() / 1000)));
  url.searchParams.set("until", String(Math.floor(hasta.getTime() / 1000)));
  url.searchParams.set("business_hours", "true");

  const res = await fetch(url, {
    headers: { api_access_token: cfg.accountToken },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Chatwoot respondió ${res.status}: ${await res.text()}`);
  return res.json();
}

/* ============================ La clasificación ============================ */

export type Nivel = "excelente" | "bien" | "vigilar" | "intervenir" | "sindatos";

export const NIVEL_META: Record<Nivel, { label: string; fg: string; bg: string; icon: string }> = {
  excelente: { label: "Excelente", fg: "#0BA45C", bg: "#E7F8F0", icon: "★" },
  bien: { label: "Bien", fg: "#2563EB", bg: "#EEF4FF", icon: "✓" },
  vigilar: { label: "A vigilar", fg: "#F59E0B", bg: "#FEF5E4", icon: "!" },
  intervenir: { label: "Necesita intervención", fg: "#FF4D2E", bg: "#FFF0ED", icon: "▲" },
  sindatos: { label: "Sin datos todavía", fg: "#94A3B8", bg: "#F1F5F9", icon: "—" },
};

/**
 * Los cuatro ejes con los que se mide a un vendedor, y cuánto pesa cada uno.
 *
 * La velocidad pesa el doble que el resto a propósito: en inmobiliaria el lead
 * escribe a tres inmobiliarias a la vez y se queda con la que contesta primero.
 * Un vendedor prolijo pero lento pierde igual.
 */
export const PESOS = { velocidad: 0.4, constancia: 0.2, resolucion: 0.25, tendencia: 0.15 };

const escalon = (v: number, cortes: [number, number][], fallback: number) => {
  for (const [limite, puntos] of cortes) if (v <= limite) return puntos;
  return fallback;
};

/** avg_first_response_time (seg) → 0-100. Menos es mejor. */
export const puntajeVelocidad = (seg: number | null) =>
  seg === null ? 0 : escalon(seg, [[300, 100], [600, 70], [900, 45]], 20);

/** messages_sent / messages_received → 0-100. Contesta lo que le escriben. */
export const puntajeConstancia = (enviados: number, recibidos: number) => {
  if (recibidos === 0) return 0;
  const r = enviados / recibidos;
  return r >= 0.9 ? 100 : r >= 0.8 ? 75 : r >= 0.7 ? 50 : 25;
};

/** resolved / total → 0-100. */
export const puntajeResolucion = (resueltas: number, total: number) => {
  if (total === 0) return 0;
  const p = (resueltas / total) * 100;
  return p >= 90 ? 100 : p >= 80 ? 75 : p >= 70 ? 50 : 25;
};

/** trend_pct → 0-100. */
export const puntajeTendencia = (pct: number) =>
  pct >= 10 ? 100 : pct >= 0 ? 70 : pct >= -10 ? 40 : 20;

export interface Clasificacion {
  nivel: Nivel;
  score: number;
  ejes: { label: string; puntaje: number; detalle: string }[];
  /** Lo concreto que hay que ir a corregir. Vacío = va bien. */
  senales: string[];
}

const fmtMin = (seg: number | null) => (seg === null ? "—" : `${Math.round(seg / 60)} min`);

/**
 * Clasifica a un empleado a partir de SU actividad en Chatwoot.
 *
 * Ojo con lo que esto NO hace: no compara Ventas contra Alquileres. Mide cómo
 * atiende cada uno (velocidad, constancia, resolución), no cuánta plata genera.
 * Un vendedor de alquileres factura mucho menos por cierre y eso no lo hace peor
 * empleado.
 */
export function clasificar(c: ChatwootAgentReport): Clasificacion {
  /**
   * Sin conversaciones no hay nada que medir, y es importante NO puntuarlo:
   * los puntajes de un agente vacío dan bajo por defecto y lo clasificarían como
   * "necesita intervención". Un vendedor que entró ayer aparecería en rojo sin
   * haber hecho nada. Ausencia de datos no es mal desempeño.
   */
  if (c.conversations_count === 0) {
    return {
      nivel: "sindatos",
      score: 0,
      ejes: [],
      senales: [],
    };
  }

  const vel = puntajeVelocidad(c.avg_first_response_time);
  const con = puntajeConstancia(c.messages_sent, c.messages_received);
  const res = puntajeResolucion(c.resolved_conversations_count, c.conversations_count);
  const ten = puntajeTendencia(c.trend_pct);

  const score = Math.round(
    vel * PESOS.velocidad + con * PESOS.constancia + res * PESOS.resolucion + ten * PESOS.tendencia
  );

  const nivel: Nivel = score >= 85 ? "excelente" : score >= 60 ? "bien" : score >= 40 ? "vigilar" : "intervenir";

  const ratio = c.messages_received === 0 ? 0 : c.messages_sent / c.messages_received;
  const pctResuelto = c.conversations_count === 0 ? 0 : (c.resolved_conversations_count / c.conversations_count) * 100;

  const senales: string[] = [];
  if (vel <= 45) senales.push(`Tarda ${fmtMin(c.avg_first_response_time)} en dar la primera respuesta`);
  if (con <= 50) senales.push(`Contesta el ${Math.round(ratio * 100)}% de los mensajes que recibe`);
  if (res <= 50) senales.push(`Deja ${c.conversations_count - c.resolved_conversations_count} de ${c.conversations_count} chats abiertos sin resolver`);
  if (ten <= 40) senales.push(`Bajó ${Math.abs(c.trend_pct)}% contra el mes pasado`);

  return {
    nivel,
    score,
    ejes: [
      { label: "Velocidad", puntaje: vel, detalle: `1ª respuesta en ${fmtMin(c.avg_first_response_time)}` },
      { label: "Constancia", puntaje: con, detalle: `contesta ${Math.round(ratio * 100)}% de lo que recibe` },
      // "chats" y no "cierra": un chat resuelto NO es una venta cerrada, y si se
      // usa el mismo verbo el 71% de acá choca con el 8% de ventas de al lado.
      { label: "Chats resueltos", puntaje: res, detalle: `deja resuelto el ${Math.round(pctResuelto)}% de sus chats` },
      { label: "Tendencia", puntaje: ten, detalle: `${c.trend_pct >= 0 ? "+" : ""}${c.trend_pct}% vs. el mes pasado` },
    ],
    senales,
  };
}

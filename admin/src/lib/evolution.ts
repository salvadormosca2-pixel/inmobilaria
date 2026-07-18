/**
 * Evolution API: el único lugar del sistema que manda WhatsApp saliente.
 *
 * El WhatsApp saliente/automático de la inmobiliaria va SIEMPRE por Evolution API
 * (no por la Cloud API de Meta). Este archivo concentra la conexión y el formateo
 * del número, para que las rutas /api/whatsapp/* no repitan headers ni URLs.
 *
 * Config por env (server-only, nunca en el bundle del cliente):
 *   EVOLUTION_URL       ej. https://evolution.josegreco.com.ar
 *   EVOLUTION_API_KEY   la apikey global de la instancia
 *   EVOLUTION_INSTANCE  nombre de la instancia (ej. "josegreco")
 */

export interface EvolutionConfig {
  baseUrl: string;
  apiKey: string;
  instance: string;
}

export function leerEvolutionConfig(): EvolutionConfig | null {
  const baseUrl = process.env.EVOLUTION_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;
  if (!baseUrl || !apiKey || !instance) return null;
  return { baseUrl, apiKey, instance };
}

/**
 * Normaliza un teléfono a lo que Evolution espera: solo dígitos, con código de
 * país. Acepta "+54 383 415-2280", "0383 415 2280", "3834152280", etc.
 *
 * Ojo Argentina: los celulares en WhatsApp llevan un 9 después del 54
 * (54 9 383 ...). Si el número entra sin país, asumimos Argentina móvil y
 * armamos 549 + área + línea. Si ya viene con 54, respetamos lo que haya.
 */
export function normalizarNumero(raw: string): string {
  let d = (raw || "").replace(/\D/g, "");
  if (!d) return "";
  // Quita el 0 inicial de larga distancia y el 15 no lo tocamos acá (varía).
  if (d.startsWith("54")) return d.startsWith("549") ? d : "549" + d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return "549" + d;
}

async function evoPost(cfg: EvolutionConfig, path: string, body: unknown) {
  const url = `${cfg.baseUrl.replace(/\/$/, "")}${path}/${cfg.instance}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: cfg.apiKey },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Evolution ${res.status}: ${text}`);
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/** Manda un mensaje de texto. */
export function enviarTexto(cfg: EvolutionConfig, numero: string, texto: string) {
  return evoPost(cfg, "/message/sendText", {
    number: normalizarNumero(numero),
    text: texto,
  });
}

/** Manda una imagen (por URL) con caption opcional. */
export function enviarImagen(
  cfg: EvolutionConfig,
  numero: string,
  urlImagen: string,
  caption = ""
) {
  return evoPost(cfg, "/message/sendMedia", {
    number: normalizarNumero(numero),
    mediatype: "image",
    media: urlImagen,
    caption,
  });
}

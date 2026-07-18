import { NextRequest, NextResponse } from "next/server";

/**
 * Calificación de un lead a partir de los 6 criterios. Función pura: no toca la
 * base ni manda nada, solo convierte criterios → score + temperatura. Es el tool
 * `calificar_lead` del Cerebro IA.
 *
 * Body: { criterios: { presupuesto, operacion, zona, urgencia, financiacion, visita } }
 *   cada criterio es boolean (¿está cubierto?). Para captación, `financiacion`
 *   representa "expectativa/exclusiva" y da igual: se cuenta sobre 6.
 *
 * Regla (alineada a la página):
 *   🔥 caliente: score >= 80  (5-6 criterios y señales fuertes)
 *   🌤 tibio:    45-79        (3-4 criterios)
 *   ❄️ frío:     < 45         (0-2 criterios)
 *
 * Los criterios "duros" (presupuesto, urgencia, visita) pesan más: son los que
 * mueven un lead a caliente de verdad.
 */
const PESOS: Record<string, number> = {
  presupuesto: 22,
  visita: 22,
  urgencia: 18,
  zona: 14,
  financiacion: 14, // financiación (venta) / garantía (alquiler) / expectativa (captación)
  operacion: 10,
};

export async function POST(req: NextRequest) {
  const { criterios } = await req.json();
  const c = criterios || {};

  let score = 0;
  const detalle: Record<string, boolean> = {};
  for (const k of Object.keys(PESOS)) {
    const ok = Boolean(c[k]);
    detalle[k] = ok;
    if (ok) score += PESOS[k];
  }
  score = Math.min(100, Math.round(score));

  const temp = score >= 80 ? "caliente" : score >= 45 ? "tibio" : "frio";
  const emoji = temp === "caliente" ? "🔥" : temp === "tibio" ? "🌤" : "❄️";
  const cubiertos = Object.values(detalle).filter(Boolean).length;

  return NextResponse.json({
    score,
    temp,
    emoji,
    criteriosCubiertos: cubiertos,
    detalle,
    derivar: temp === "caliente",
  });
}

import { NextRequest, NextResponse } from "next/server";

/**
 * Guarda las rutas que dispara n8n (mandar WhatsApp, derivar). Como estas rutas
 * provocan mensajes salientes reales, no pueden quedar abiertas.
 *
 * Si está definida N8N_SHARED_SECRET, exigimos el header `x-n8n-secret`.
 * Si NO está definida (entorno de desarrollo), deja pasar pero es tu
 * responsabilidad configurarla antes de exponer la app.
 *
 * Devuelve una respuesta 401 si hay que cortar, o null si puede seguir.
 */
export function guardN8n(req: NextRequest): NextResponse | null {
  const secret = process.env.N8N_SHARED_SECRET;
  if (!secret) return null; // dev: sin secreto configurado
  const enviado = req.headers.get("x-n8n-secret");
  if (enviado !== secret) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  return null;
}

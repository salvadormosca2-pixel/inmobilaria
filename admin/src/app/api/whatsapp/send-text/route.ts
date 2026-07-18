import { NextRequest, NextResponse } from "next/server";
import { guardN8n } from "@/lib/n8n";
import { leerEvolutionConfig, enviarTexto } from "@/lib/evolution";

/**
 * Manda un texto por WhatsApp (Evolution API).
 * Body: { telefono, texto }
 */
export async function POST(req: NextRequest) {
  const no = guardN8n(req);
  if (no) return no;

  const cfg = leerEvolutionConfig();
  if (!cfg) {
    return NextResponse.json(
      { error: "Evolution no configurado (faltan EVOLUTION_URL / EVOLUTION_API_KEY / EVOLUTION_INSTANCE)" },
      { status: 503 }
    );
  }

  const { telefono, texto } = await req.json();
  if (!telefono || !texto) {
    return NextResponse.json({ error: "telefono y texto requeridos" }, { status: 400 });
  }

  try {
    const r = await enviarTexto(cfg, telefono, texto);
    return NextResponse.json({ ok: true, resultado: r });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 502 });
  }
}

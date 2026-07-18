import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardN8n } from "@/lib/n8n";
import { leerConfig } from "@/lib/chatwoot";
import { elegirAgente } from "@/lib/routing";

/**
 * Deriva un lead CALIENTE a un vendedor humano. Hace tres cosas en Chatwoot y una
 * en el CRM:
 *   1. Asigna la conversación al vendedor de la zona (por área + zona).
 *   2. Deja una NOTA PRIVADA con el resumen (solo la ve el equipo, no el cliente).
 *   3. Marca la conversación con custom attribute `ia_activa=false` para que el
 *      bot deje de responder (el humano toma el control).
 *   4. Upsert del lead en el CRM con el resumen y estado "contactado".
 *
 * Body: { conversationId, area, zona, telefono, nombre?, resumen }
 * Devuelve el vendedor asignado (para que la IA le avise a la persona).
 */
export async function POST(req: NextRequest) {
  const no = guardN8n(req);
  if (no) return no;

  const { conversationId, area, zona, telefono, nombre, resumen } = await req.json();
  if (!conversationId || !area) {
    return NextResponse.json({ error: "conversationId y area requeridos" }, { status: 400 });
  }

  const agente = elegirAgente(area, zona || "");
  if (!agente) {
    return NextResponse.json({ error: `sin agente para el área "${area}"` }, { status: 422 });
  }

  const cfg = leerConfig();
  const resultados: Record<string, unknown> = { vendedor: agente.nombre };

  if (cfg) {
    const base = `${cfg.baseUrl.replace(/\/$/, "")}/api/v1/accounts/${cfg.accountId}/conversations/${conversationId}`;
    const headers = { "Content-Type": "application/json", api_access_token: cfg.accountToken };
    try {
      // 1. Asignar al vendedor
      await fetch(`${base}/assignments`, {
        method: "POST",
        headers,
        body: JSON.stringify({ assignee_id: agente.chatwootId }),
      });
      // 2. Nota privada con el resumen
      await fetch(`${base}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: `🔥 Lead caliente derivado por el bot.\n\n${resumen || "(sin resumen)"}`,
          message_type: "outgoing",
          private: true,
        }),
      });
      // 3. Frenar el bot en esta conversación
      await fetch(`${base}/custom_attributes`, {
        method: "POST",
        headers,
        body: JSON.stringify({ custom_attributes: { ia_activa: false } }),
      });
      resultados.chatwoot = "ok";
    } catch (e) {
      resultados.chatwoot = `error: ${String(e)}`;
    }
  } else {
    resultados.chatwoot = "no configurado (se derivó igual en el CRM)";
  }

  // 4. Upsert del lead con el resumen
  if (telefono) {
    const data = {
      nombre: nombre || "Sin nombre",
      telefono,
      resumenIA: resumen || "",
      estado: "contactado",
      notaVendedor: `Asignado a ${agente.nombre} por el bot.`,
    };
    const existente = await prisma.lead.findFirst({ where: { telefono } });
    resultados.lead = existente
      ? await prisma.lead.update({ where: { id: existente.id }, data })
      : await prisma.lead.create({ data });
  }

  return NextResponse.json({ ok: true, ...resultados });
}

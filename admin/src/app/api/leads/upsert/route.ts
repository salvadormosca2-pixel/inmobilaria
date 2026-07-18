import { prisma } from "@/lib/prisma";
import { guardN8n } from "@/lib/n8n";
import { NextRequest, NextResponse } from "next/server";

/**
 * Upsert de lead POR TELÉFONO. Lo usa el Cerebro IA (n8n): a lo largo de una
 * conversación el mismo teléfono escribe varias veces; no queremos un lead nuevo
 * por mensaje, sino UN lead que se va enriqueciendo con el resumen.
 *
 * Body:
 *   { telefono, nombre?, resumenIA?, estado?, atendido?, notaVendedor? }
 * Actualiza el lead existente con ese teléfono, o lo crea si no hay.
 */
export async function POST(req: NextRequest) {
  const no = guardN8n(req);
  if (no) return no;

  const body = await req.json();
  const telefono: string = (body.telefono || "").trim();
  if (!telefono) {
    return NextResponse.json({ error: "telefono requerido" }, { status: 400 });
  }

  // Solo dejamos escribir los campos del modelo Lead.
  const data: Record<string, unknown> = {};
  for (const k of ["nombre", "telefono", "resumenIA", "estado", "atendido", "notaVendedor"]) {
    if (body[k] !== undefined) data[k] = body[k];
  }

  const existente = await prisma.lead.findFirst({ where: { telefono } });
  const lead = existente
    ? await prisma.lead.update({ where: { id: existente.id }, data })
    : await prisma.lead.create({
        data: { nombre: body.nombre || "Sin nombre", telefono, ...data },
      });

  return NextResponse.json(lead, { status: existente ? 200 : 201 });
}

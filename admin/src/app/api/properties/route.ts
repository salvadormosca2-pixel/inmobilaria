import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const categoria = searchParams.get("categoria") || "";
  const operacion = searchParams.get("operacion") || "";
  const estado = searchParams.get("estado") || "";

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { titulo: { contains: q } },
      { ubicacion: { contains: q } },
      { descripcion: { contains: q } },
    ];
  }
  if (categoria) where.categoria = categoria;
  if (operacion) where.operacion = operacion;
  if (estado) where.estado = estado;

  const properties = await prisma.property.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(properties);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const property = await prisma.property.create({ data: body });
  return NextResponse.json(property, { status: 201 });
}

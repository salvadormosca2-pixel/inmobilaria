import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const estado = searchParams.get("estado") || "";
  const atendido = searchParams.get("atendido");

  const where: Record<string, unknown> = {};
  if (estado) where.estado = estado;
  if (atendido !== null && atendido !== "") where.atendido = atendido === "true";

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const lead = await prisma.lead.create({ data: body });
  return NextResponse.json(lead, { status: 201 });
}

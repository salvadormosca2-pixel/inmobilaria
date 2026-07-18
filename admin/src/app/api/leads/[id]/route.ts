import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id: Number(id) },
  });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const lead = await prisma.lead.update({
    where: { id: Number(id) },
    data: body,
  });
  return NextResponse.json(lead);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.lead.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}

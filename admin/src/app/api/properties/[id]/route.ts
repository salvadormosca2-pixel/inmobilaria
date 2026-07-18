import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id: Number(id) },
  });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(property);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const property = await prisma.property.update({
    where: { id: Number(id) },
    data: body,
  });
  return NextResponse.json(property);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.property.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}

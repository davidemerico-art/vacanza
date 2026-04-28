import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

type DeleteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: DeleteContext) {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (!id) {
    return NextResponse.json({ success: false, message: "ID non valido." }, { status: 400 });
  }

  await prisma.servizio.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

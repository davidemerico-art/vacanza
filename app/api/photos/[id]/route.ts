import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type DeleteContext = { params: { id: string } };

export async function DELETE(_req: Request, { params }: DeleteContext) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ success: false, message: "ID foto non valido." }, { status: 400 });
  }

  const photo = await prisma.photo.delete({ where: { id } });
  if (photo.url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", photo.url);
    await fs.unlink(filePath).catch(() => null);
  }

  return NextResponse.json({ success: true });
}

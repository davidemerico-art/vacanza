import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const photos = await prisma.photo.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(photos);
}

export async function POST(req: Request) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ success: false, message: "URL dell'immagine mancante." }, { status: 400 });
  }

  const photo = await prisma.photo.create({ data: { url } });
  return NextResponse.json(photo);
}

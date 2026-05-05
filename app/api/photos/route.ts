import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const photos = await prisma.photo.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(photos);
}

export async function POST(req: Request) {
  let url: string | undefined;
  let file: File | null = null;
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    url = formData.get("url")?.toString() || undefined;
    const maybeFile = formData.get("file");
    if (maybeFile instanceof File && maybeFile.size > 0) {
      file = maybeFile;
    }
  } else {
    const body = await req.json();
    url = body.url;
  }

  if (!url && !file) {
    return NextResponse.json({ success: false, message: "URL dell'immagine mancante." }, { status: 400 });
  }

  if (file) {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(uploadsDir, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    url = `/uploads/${safeName}`;
  }

  const photo = await prisma.photo.create({ data: { url: url! } });
  return NextResponse.json(photo);
}

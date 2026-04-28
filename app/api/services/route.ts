import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const services = await prisma.servizio.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(services);
}

export async function POST(req: Request) {
  const { nome, descrizione, immagine, incluso } = await req.json();

  if (!nome || !descrizione || !immagine) {
    return NextResponse.json({ success: false, message: "Compila tutti i campi." }, { status: 400 });
  }

  const service = await prisma.servizio.create({
    data: {
      nome,
      descrizione,
      immagine,
      incluso: !!incluso,
    },
  });

  return NextResponse.json(service);
}

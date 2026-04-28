import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const { senderType, senderName, content } = await req.json();

  if (!senderType || !senderName || !content?.trim()) {
    return NextResponse.json({ success: false, message: "Messaggio non valido." }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      senderType,
      senderName,
      content: content.trim(),
    },
  });

  return NextResponse.json({ success: true, message });
}

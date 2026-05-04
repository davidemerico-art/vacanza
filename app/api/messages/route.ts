import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userEmail = url.searchParams.get("userEmail");

  const messages = await prisma.message.findMany({
    where: userEmail ? { userEmail } : undefined,
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const { senderType, senderName, content, userEmail } = await req.json();

  if (!senderType || !senderName || !content?.trim() || !userEmail) {
    return NextResponse.json({ success: false, message: "Messaggio non valido." }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      senderType,
      senderName,
      userEmail,
      content: content.trim(),
    },
  });

  return NextResponse.json({ success: true, message });
}

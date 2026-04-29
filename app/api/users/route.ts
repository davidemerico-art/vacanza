import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { action, name, email, password } = await req.json();

  if (action === "register") {
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: "Compila tutti i campi." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, message: "Email già registrata." }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: { name, email, password }
    });

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  }

  if (action === "login") {
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Compila tutti i campi." }, { status: 400 });
    }

    const user = await prisma.user.findFirst({ where: { email, password } });
    if (!user) {
      return NextResponse.json({ success: false, message: "Credenziali errate." }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
  }

  return NextResponse.json({ success: false, message: "Azione non valida." }, { status: 400 });
}

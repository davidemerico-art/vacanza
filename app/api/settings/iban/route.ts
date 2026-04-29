import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const setting = await prisma.setting.findUnique({ where: { key: "iban" } });
  return NextResponse.json({ iban: setting?.value || "" });
}

export async function PUT(req: Request) {
  const { iban } = await req.json();
  const setting = await prisma.setting.upsert({
    where: { key: "iban" },
    update: { value: iban },
    create: { key: "iban", value: iban },
  });
  return NextResponse.json(setting);
}

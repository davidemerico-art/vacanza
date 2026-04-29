import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const ADMIN_PHONE_KEY = "adminPhone";

export async function GET() {
  const setting = await prisma.setting.findUnique({ where: { key: ADMIN_PHONE_KEY } });
  return NextResponse.json({ phone: setting?.value || "" });
}

export async function PUT(req: Request) {
  const { phone } = await req.json();
  const cleanPhone = typeof phone === "string" ? phone.trim() : "";

  await prisma.setting.upsert({
    where: { key: ADMIN_PHONE_KEY },
    update: { value: cleanPhone },
    create: { key: ADMIN_PHONE_KEY, value: cleanPhone },
  });

  return NextResponse.json({ success: true, phone: cleanPhone });
}

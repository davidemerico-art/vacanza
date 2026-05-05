import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BNB_DESCRIPTION_KEY = "bnbDescription";

export async function GET() {
  const setting = await prisma.setting.findUnique({ where: { key: BNB_DESCRIPTION_KEY } });
  return NextResponse.json({ description: setting?.value || "" });
}

export async function PUT(req: Request) {
  const { description } = await req.json();
  const cleanDescription = typeof description === "string" ? description.trim() : "";

  await prisma.setting.upsert({
    where: { key: BNB_DESCRIPTION_KEY },
    update: { value: cleanDescription },
    create: { key: BNB_DESCRIPTION_KEY, value: cleanDescription },
  });

  return NextResponse.json({ success: true, description: cleanDescription });
}
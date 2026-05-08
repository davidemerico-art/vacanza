import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BNB_DESCRIPTION_KEY = "bnbDescription";
const BNB_DESCRIPTION_EN_KEY = "bnbDescriptionEn";

export async function GET() {
  const [settingIt, settingEn] = await Promise.all([
    prisma.setting.findUnique({ where: { key: BNB_DESCRIPTION_KEY } }),
    prisma.setting.findUnique({ where: { key: BNB_DESCRIPTION_EN_KEY } }),
  ]);
  return NextResponse.json({
    description: settingIt?.value || "",
    descriptionEn: settingEn?.value || "",
  });
}

export async function PUT(req: Request) {
  const { description, descriptionEn } = await req.json();
  const cleanDescription = typeof description === "string" ? description.trim() : "";
  const cleanDescriptionEn = typeof descriptionEn === "string" ? descriptionEn.trim() : "";

  await Promise.all([
    prisma.setting.upsert({
      where: { key: BNB_DESCRIPTION_KEY },
      update: { value: cleanDescription },
      create: { key: BNB_DESCRIPTION_KEY, value: cleanDescription },
    }),
    prisma.setting.upsert({
      where: { key: BNB_DESCRIPTION_EN_KEY },
      update: { value: cleanDescriptionEn },
      create: { key: BNB_DESCRIPTION_EN_KEY, value: cleanDescriptionEn },
    }),
  ]);

  return NextResponse.json({
    success: true,
    description: cleanDescription,
    descriptionEn: cleanDescriptionEn,
  });
}
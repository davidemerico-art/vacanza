import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

const PRICE_INTERA_KEY = "priceInteraPerNight";
const PRICE_MEZZA_KEY = "priceMezzaPerNight";

function parsePositiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

export async function GET() {
  const [intera, mezza] = await Promise.all([
    prisma.setting.findUnique({ where: { key: PRICE_INTERA_KEY } }),
    prisma.setting.findUnique({ where: { key: PRICE_MEZZA_KEY } }),
  ]);

  // Default fallback (se non configurati)
  const priceInteraPerNight = intera?.value ? Number(intera.value) : 100;
  const priceMezzaPerNight = mezza?.value ? Number(mezza.value) : 80;

  return NextResponse.json({
    priceInteraPerNight: Number.isFinite(priceInteraPerNight) ? priceInteraPerNight : 100,
    priceMezzaPerNight: Number.isFinite(priceMezzaPerNight) ? priceMezzaPerNight : 80,
  });
}

export async function PUT(req: Request) {
  const { priceInteraPerNight, priceMezzaPerNight } = await req.json();

  const intera = parsePositiveNumber(priceInteraPerNight);
  const mezza = parsePositiveNumber(priceMezzaPerNight);

  if (intera === null || mezza === null) {
    return NextResponse.json(
      { success: false, message: "Prezzi non validi. Inserisci numeri positivi." },
      { status: 400 }
    );
  }

  await Promise.all([
    prisma.setting.upsert({
      where: { key: PRICE_INTERA_KEY },
      update: { value: String(intera) },
      create: { key: PRICE_INTERA_KEY, value: String(intera) },
    }),
    prisma.setting.upsert({
      where: { key: PRICE_MEZZA_KEY },
      update: { value: String(mezza) },
      create: { key: PRICE_MEZZA_KEY, value: String(mezza) },
    }),
  ]);

  return NextResponse.json({ success: true });
}


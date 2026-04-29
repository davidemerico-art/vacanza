import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const bookings = await prisma.prenotazione.findMany({ orderBy: { date: "asc" } });
  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const { email, userName, checkIn, checkOut, tipo } = body || {};

    if ((!email && !userName) || !checkIn || !checkOut || !tipo) {
      return NextResponse.json({ success: false, message: "Compila tutti i campi." }, { status: 400 });
    }

    let bookingUser = userName || "";
    if (!bookingUser && email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ success: false, message: "Utente non trovato." }, { status: 400 });
      }
      bookingUser = user.name;
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (start > end) {
      return NextResponse.json({ success: false, message: "Date non valide." }, { status: 400 });
    }

    const dates: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split("T")[0] || "");
    }

    const existing = await prisma.prenotazione.findMany({
      where: {
        date: { in: dates },
      },
    });

    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: "Alcune date sono già prenotate." }, { status: 400 });
    }

    const groupId = crypto.randomUUID();
    await prisma.prenotazione.createMany({
      data: dates.map((date) => ({
        date,
        tipo,
        user: bookingUser,
        userEmail: email || "",
        status: "PENDING",
        groupId,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Booking POST error:', error);
    return NextResponse.json({ success: false, message: 'Errore interno del server.' }, { status: 500 });
  }
}

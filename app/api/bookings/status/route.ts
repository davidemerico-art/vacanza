import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const { groupId, status } = await req.json();

  if (!groupId || !status) {
    return NextResponse.json({ success: false, message: "Dati mancanti." }, { status: 400 });
  }

  try {
    await prisma.prenotazione.updateMany({
      where: { groupId },
      data: { status },
    });

    // If status is CONFIRMED, send a message to the user
    if (status === "CONFIRMED") {
      const firstBooking = await prisma.prenotazione.findFirst({ where: { groupId } });
      if (firstBooking) {
        await prisma.message.create({
          data: {
            senderType: "admin",
            senderName: "Admin",
            content: `La tua prenotazione per il ${firstBooking.date} è stata confermata! Grazie.`,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json({ success: false, message: "Errore durante l'aggiornamento." }, { status: 500 });
  }
}

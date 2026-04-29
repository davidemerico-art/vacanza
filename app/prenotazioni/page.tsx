"use client";

import { useState, useEffect } from "react";
import BookingCalendar, { type BookingByDate } from "../components/booking-calendar";

interface Prenotazione {
  id: number;
  date: string;
  user: string;
  tipo: 'intera' | 'mezza';
  status: string;
  groupId: string;
}

export default function Prenotazioni() {
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>(() => {
    return [];
  });
  const [priceInteraPerNight, setPriceInteraPerNight] = useState<number>(100);
  const [priceMezzaPerNight, setPriceMezzaPerNight] = useState<number>(80);
  const [iban, setIban] = useState("");

  const bookingsByDate = prenotazioni.reduce<Record<string, BookingByDate>>((acc, p) => {
    acc[p.date] = { user: p.user, tipo: p.tipo };
    return acc;
  }, {});

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const type = localStorage.getItem('userType') as 'user' | 'admin' | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserType(loggedIn && type === 'admin' ? type : null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthResolved(true);
  }, []);

  useEffect(() => {
    if (!authResolved) return;
    if (!userType) {
      window.location.href = '/';
      return;
    }

    const loadAll = async () => {
      const [resBookings, resPrices] = await Promise.all([fetch('/api/bookings'), fetch('/api/settings/prices')]);

      if (resBookings.ok) {
        const data = await resBookings.json();
        setPrenotazioni(data);
      }

      if (resPrices.ok) {
        const data = await resPrices.json();
        setPriceInteraPerNight(typeof data.priceInteraPerNight === 'number' ? data.priceInteraPerNight : 100);
        setPriceMezzaPerNight(typeof data.priceMezzaPerNight === 'number' ? data.priceMezzaPerNight : 80);
      }

      const resIban = await fetch('/api/settings/iban');
      if (resIban.ok) {
        const data = await resIban.json();
        setIban(data.iban);
      }
    };

    loadAll();
  }, [authResolved, userType]);

  const handleSavePrices = async () => {
    const res = await fetch('/api/settings/prices', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceInteraPerNight, priceMezzaPerNight }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data?.message || 'Errore durante il salvataggio dei prezzi.');
      return;
    }

    alert('Prezzi aggiornati!');
  };

  const handleSaveIban = async () => {
    const res = await fetch('/api/settings/iban', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ iban }),
    });
    if (res.ok) alert('IBAN salvato!');
  };

  const handleConfirmBooking = async (groupId: string) => {
    const res = await fetch('/api/bookings/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, status: 'CONFIRMED' }),
    });
    if (res.ok) {
      alert('Prenotazione confermata!');
      window.location.reload();
    }
  };

  const handleDeletePrenotazione = async (id: number) => {
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    const res = await fetch('/api/bookings');
    if (!res.ok) return;
    const data = await res.json();
    setPrenotazioni(data);
  };

  if (!authResolved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl">Caricamento...</div>
      </div>
    );
  }

  if (!userType) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logopng.png" alt="Casa Vacanza" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Casa Vacanza - Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => (window.location.href = "/messaggi")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Messaggi
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-800 dark:text-gray-200">
          Gestione Prenotazioni
        </h1>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Prezzi</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Pensione Intera (€/notte)
                </label>
                <input
                  type="number"
                  min={1}
                  value={priceInteraPerNight}
                  onChange={(e) => setPriceInteraPerNight(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Mezza Pensione (€/notte)
                </label>
                <input
                  type="number"
                  min={1}
                  value={priceMezzaPerNight}
                  onChange={(e) => setPriceMezzaPerNight(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={handleSavePrices}
              className="mt-4 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Salva prezzi
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Impostazioni Pagamento</h2>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Il tuo IBAN (per i pagamenti degli utenti)
              </label>
              <input
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="Inserisci IBAN..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
              />
            </div>
            <button
              onClick={handleSaveIban}
              className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Salva IBAN
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Calendario Prenotazioni</h2>
            <div className="flex items-center gap-4 text-sm mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
                <span>Giorni prenotati (nome in calendario)</span>
              </div>
            </div>
            <BookingCalendar bookingsByDate={bookingsByDate} mode="admin" />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Tutte le Prenotazioni</h2>
            {prenotazioni.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Nessuna prenotazione.</p>
            ) : (
              <div className="space-y-4">
                {Object.values(prenotazioni.reduce((acc: any, p) => {
                  if (!acc[p.groupId]) acc[p.groupId] = { ...p, dates: [] };
                  acc[p.groupId].dates.push(p.date);
                  return acc;
                }, {})).map((booking: any) => (
                  <div
                    key={booking.groupId}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg gap-4"
                  >
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {booking.dates[0]} - {booking.dates[booking.dates.length - 1]}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Utente: {booking.user} | Tipo: {booking.tipo} | Stato: <span className={`font-bold ${
                          booking.status === 'CONFIRMED' ? 'text-green-600' : 
                          booking.status === 'PAID_WAITING' ? 'text-blue-600' : 'text-orange-600'
                        }`}>{booking.status}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      {booking.status === 'PAID_WAITING' && (
                        <button
                          onClick={() => handleConfirmBooking(booking.groupId)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-bold"
                        >
                          CONFERMA PAGAMENTO
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          if (confirm("Eliminare tutte le date di questa prenotazione?")) {
                            for (const date of booking.dates) {
                              const p = prenotazioni.find(pr => pr.groupId === booking.groupId && pr.date === date);
                              if (p) await fetch(`/api/bookings/${p.id}`, { method: "DELETE" });
                            }
                            window.location.reload();
                          }
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
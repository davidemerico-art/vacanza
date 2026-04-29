"use client";

import { useState, useEffect } from "react";
import BookingCalendar, { type BookingByDate } from "../components/booking-calendar";

interface Prenotazione {
  id: number;
  date: string;
  user: string;
  tipo: 'intera' | 'mezza';
}

export default function Prenotazioni() {
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>(() => {
    return [];
  });
  const [priceInteraPerNight, setPriceInteraPerNight] = useState<number>(100);
  const [priceMezzaPerNight, setPriceMezzaPerNight] = useState<number>(80);

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
              <ul className="space-y-2">
                {prenotazioni.map((p) => (
                  <li
                    key={p.id}
                    className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{p.date}</span> - {p.user} ({p.tipo})
                    </div>
                    <button
                      onClick={() => handleDeletePrenotazione(p.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Elimina
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
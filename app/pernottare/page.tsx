"use client";

import { useState, useEffect } from "react";
import BookingCalendar, { type BookingByDate } from "../components/booking-calendar";

interface Prenotazione {
  id: number;
  date: string;
  user: string;
  tipo: 'intera' | 'mezza';
}

export default function Pernottare() {
  const [userType, setUserType] = useState<'user' | 'admin' | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [tipoPensione, setTipoPensione] = useState<'intera' | 'mezza'>('intera');
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([]);
  const [selectedStartIso, setSelectedStartIso] = useState<string | null>(null);
  const [selectedEndIso, setSelectedEndIso] = useState<string | null>(null);
  const [adulti, setAdulti] = useState<number>(2);
  const [bambini, setBambini] = useState<number>(0);
  const [userName] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('userName') || '';
  });
  const [userEmail] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('userEmail') || '';
  });

  const [prices, setPrices] = useState<{ priceInteraPerNight: number; priceMezzaPerNight: number }>(() => ({
    priceInteraPerNight: 100,
    priceMezzaPerNight: 80,
  }));

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const type = localStorage.getItem('userType') as 'user' | 'admin' | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserType(loggedIn && type === 'user' ? type : null);
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
        setPrices({
          priceInteraPerNight: typeof data.priceInteraPerNight === 'number' ? data.priceInteraPerNight : 100,
          priceMezzaPerNight: typeof data.priceMezzaPerNight === 'number' ? data.priceMezzaPerNight : 80,
        });
      }
    };

    loadAll();
  }, [authResolved, userType]);

  const bookingsByDate = prenotazioni.reduce<Record<string, BookingByDate>>((acc, p) => {
    acc[p.date] = { user: p.user, tipo: p.tipo };
    return acc;
  }, {});

  const isDateBooked = (dateIso: string) => Boolean(bookingsByDate[dateIso]);

  const getIsoRangeDays = (startIso: string, endIso: string) => {
    const start = new Date(`${startIso}T00:00:00Z`);
    const end = new Date(`${endIso}T00:00:00Z`);
    const days: string[] = [];

    const first = start <= end ? start : end;
    const last = start <= end ? end : start;

    for (let d = new Date(first); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  };

  const selectedNightsCount = (() => {
    if (!selectedStartIso || !selectedEndIso) return null;
    const start = new Date(`${selectedStartIso}T00:00:00Z`);
    const end = new Date(`${selectedEndIso}T00:00:00Z`);
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const nights = (diffDays >= 0 ? diffDays : -diffDays) + 1;
    return nights;
  })();

  const handlePrenota = async () => {
    if (selectedStartIso && selectedEndIso && userName && userEmail) {
      const dates = getIsoRangeDays(selectedStartIso, selectedEndIso);
      const conflict = dates.some((date) => isDateBooked(date));
      if (conflict) {
        alert("Alcune date sono già prenotate. Riprova selezionando un intervallo libero.");
        return;
      }

      if (adulti + bambini < 1) {
        alert("Inserisci almeno 1 ospite (adulti o bambini).");
        return;
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          userName,
          checkIn: selectedStartIso,
          checkOut: selectedEndIso,
          tipo: tipoPensione,
        })
      });
      const result = await response.json();
      if (!response.ok) {
        alert(result.message || 'Errore durante la prenotazione.');
        return;
      }
      const listResponse = await fetch('/api/bookings');
      if (listResponse.ok) {
        setPrenotazioni(await listResponse.json());
      }
      alert('Prenotazione effettuata!');
      setSelectedStartIso(null);
      setSelectedEndIso(null);
    } else {
      alert('Seleziona le date.');
    }
  };

  if (!authResolved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl">Caricamento...</div>
      </div>
    );
  }

  if (!userType) return null;

  const pricePerNight = tipoPensione === "intera" ? prices.priceInteraPerNight : prices.priceMezzaPerNight;
  const nightlyGuestsTotal = adulti * pricePerNight + bambini * (pricePerNight / 2);
  const totalCost = selectedNightsCount ? selectedNightsCount * nightlyGuestsTotal : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logopng.png" alt="Casa Vacanza" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Casa Vacanza</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-800 dark:text-gray-200">Prenota il tuo Soggiorno</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-start justify-between gap-6 mb-4">
              <div className="flex flex-col gap-2">
                <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">Seleziona le date</div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
                    <span>Già prenotato</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-emerald-200" />
                    <span>Selezione</span>
                  </div>
                </div>
              </div>
              {(selectedStartIso || selectedEndIso) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStartIso(null);
                    setSelectedEndIso(null);
                  }}
                  className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Pulisci
                </button>
              )}
            </div>

            <BookingCalendar
              bookingsByDate={bookingsByDate}
              mode="user"
              selectedStartIso={selectedStartIso}
              selectedEndIso={selectedEndIso}
              onDayClick={(isoDate) => {
                const booked = isDateBooked(isoDate);
                if (booked) {
                  alert("Questo giorno è già prenotato. Seleziona un giorno libero.");
                  return;
                }

                // Selezione intervallo con 2 click: prima data (start), seconda data (end)
                if (!selectedStartIso || (selectedStartIso && selectedEndIso)) {
                  setSelectedStartIso(isoDate);
                  setSelectedEndIso(null);
                  return;
                }

                // Secondo click: calcoliamo range e verifichiamo conflitti.
                const start = selectedStartIso;
                const end = isoDate;
                const allDays = getIsoRangeDays(start, end);
                const conflict = allDays.some((d) => isDateBooked(d));

                if (conflict) {
                  alert("L’intervallo selezionato include giorni già prenotati. Seleziona un altro intervallo.");
                  return;
                }

                const startDate = new Date(`${start}T00:00:00Z`);
                const endDate = new Date(`${end}T00:00:00Z`);
                if (endDate < startDate) {
                  setSelectedStartIso(end);
                  setSelectedEndIso(start);
                } else {
                  setSelectedStartIso(start);
                  setSelectedEndIso(end);
                }
              }}
            />

            <div className="mt-6 grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Adulti</label>
                  <input
                    type="number"
                    min={0}
                    value={adulti}
                    onChange={(e) => setAdulti(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Bambini (0-14 anni)</label>
                  <input
                    type="number"
                    min={0}
                    value={bambini}
                    onChange={(e) => setBambini(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tipo di Pensione</label>
                <select
                  value={tipoPensione}
                  onChange={(e) => setTipoPensione(e.target.value as "intera" | "mezza")}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="intera">Pensione Intera</option>
                  <option value="mezza">Mezza Pensione</option>
                </select>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30">
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  {selectedStartIso && selectedEndIso ? (
                    <>
                      <div className="font-semibold mb-1">Riepilogo</div>
                      <div>Check-in: <span className="font-medium">{selectedStartIso}</span></div>
                      <div>Check-out: <span className="font-medium">{selectedEndIso}</span></div>
                      <div>Notti: <span className="font-medium">{selectedNightsCount}</span></div>
                      <div>Ospiti: <span className="font-medium">{adulti} adulti</span>, <span className="font-medium">{bambini} bambini</span></div>
                      <div className="text-[12px] text-gray-600 dark:text-gray-400 mt-1">
                        I bambini pagano la meta del prezzo.
                      </div>
                      <div className="mt-2">
                        Totale:{" "}
                        <span className="font-bold text-green-700 dark:text-green-300">
                          €{totalCost?.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[12px] text-gray-600 dark:text-gray-400 mt-1">
                        Prezzo per notte: €{pricePerNight} per adulto, €{(pricePerNight / 2).toFixed(2)} per bambino
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-600 dark:text-gray-400">Seleziona almeno due date nel calendario per vedere il costo totale.</div>
                  )}
                </div>
              </div>

              <button
                onClick={handlePrenota}
                disabled={!selectedStartIso || !selectedEndIso}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Prenota
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Mappa</h2>
            <div className="flex items-center gap-4 text-sm mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
                <span>Casa: Via Vecchia Frigole 35</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
                <span>Centro: Piazza Sant&apos;Oronzo</span>
              </div>
            </div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3083.1234!2d18.1714!3d40.3515!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1344108b8c7c7c7c7%3A0x1234567890abcdef!2zTGVjY2UsIEl0YWxpYQ!5e0!3m2!1sit!2sit!4v1234567890!5m2!1sit!2sit"
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: "8px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Il punto rosso indica “Casa Vacanza”, mentre il punto blu indica il “Centro storico” (Piazza Sant&apos;Oronzo).
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}